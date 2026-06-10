import { getMeasureInterval } from '../../grid/helpers/subdivisionHelper.js';

function alignEndToMeasureBoundary(col, interval) {
  const remainder = (col + 1) % interval;
  return remainder === 0 ? col : col + (interval - remainder);
}

/**
 * 배치 상태에서 재생 범위와 마커 위치를 계산합니다.
 *
 * - 전체 타임라인: 악기(및 마커)의 최소~최대 열, 끝은 마디 경계로 정렬.
 *   끝까지 가면 처음으로 되감겨 무한 반복(루프 머신 기본 동작).
 * - 시작점(start): 재생이 시작되고, 타임라인이 한 바퀴 돌면 되감기는 열입니다.
 *   (없으면 가장 왼쪽 오브젝트에서 시작)
 * - 중단점(breakpoint): 재생 헤드가 이 열에 도달하면 재생을 정지합니다.
 * - 도돌이표 시작/끝: 악보의 도돌이표처럼 — 끝 기호에 도달하면 시작 기호로
 *   한 번 되감고, 두 번째 통과 때는 그대로 지나갑니다. 타임라인이 한 바퀴
 *   돌면 반복 상태가 초기화됩니다. 끝 기호만 있으면 곡 처음부터, 시작
 *   기호만 있으면 곡 끝에서 되감습니다.
 * - 무한 도돌이표 시작/끝: 끝 기호에 도달하면 항상 시작 기호로 되감아
 *   해당 구간을 무한 반복합니다 (음악 점검용).
 *
 * @returns {{ loopStart, loopEnd, breakpoint, repeatStart, repeatEnd,
 *             infiniteStart, infiniteEnd } | null}
 */
export function computeRange(playbackManager, objectManager) {
  const instrumentCols = [];
  let startMarker = null;
  let breakpoint = null;
  let repeatStart = null;
  let repeatEnd = null;
  let infiniteStart = null;
  let infiniteEnd = null;

  objectManager.objects.forEach((obj, cellKey) => {
    const col = parseInt(cellKey.split('-')[0], 10);
    const marker = obj.detail?.marker;
    if (marker === 'start') startMarker = col;
    else if (marker === 'stop') breakpoint = col;
    else if (marker === 'repeat_start') repeatStart = col;
    else if (marker === 'repeat_end') repeatEnd = col;
    else if (marker === 'infinite_start') infiniteStart = col;
    else if (marker === 'infinite_end') infiniteEnd = col;
    else instrumentCols.push(col);
  });

  if (repeatStart !== null && repeatEnd !== null && repeatEnd < repeatStart) {
    [repeatStart, repeatEnd] = [repeatEnd, repeatStart];
  }
  if (infiniteStart !== null && infiniteEnd !== null && infiniteEnd < infiniteStart) {
    [infiniteStart, infiniteEnd] = [infiniteEnd, infiniteStart];
  }

  const rangeCols = [...instrumentCols];
  for (const c of [startMarker, repeatStart, repeatEnd, infiniteStart, infiniteEnd, breakpoint]) {
    if (c !== null) rangeCols.push(c);
  }
  if (!rangeCols.length) return null;

  const interval = getMeasureInterval(playbackManager.subdivision);
  // 시작 위치 우선순위: 명시적 시작점 > 무한 도돌이표 시작(구간 점검용) > 가장 왼쪽
  const loopStart = startMarker ?? infiniteStart ?? Math.min(...rangeCols);
  const loopEnd = alignEndToMeasureBoundary(Math.max(...rangeCols), interval);

  // 도돌이표/무한반복이 한쪽만 있으면 빠진 쪽을 악보 규칙대로 보완
  const hasRepeat = repeatStart !== null || repeatEnd !== null;
  const hasInfinite = infiniteStart !== null || infiniteEnd !== null;

  return {
    loopStart,
    loopEnd,
    breakpoint,
    repeatStart: hasRepeat ? (repeatStart ?? loopStart) : null,
    repeatEnd: hasRepeat ? (repeatEnd ?? loopEnd) : null,
    infiniteStart: hasInfinite ? (infiniteStart ?? loopStart) : null,
    infiniteEnd: hasInfinite ? (infiniteEnd ?? loopEnd) : null,
  };
}

function applyRange(playbackManager, range) {
  playbackManager._startCol = range.loopStart;
  playbackManager._loopStartCol = range.loopStart;
  playbackManager._endCol = range.loopEnd;
  playbackManager._breakpointCol = range.breakpoint;
  playbackManager._repeatStartCol = range.repeatStart;
  playbackManager._repeatEndCol = range.repeatEnd;
  playbackManager._infiniteStartCol = range.infiniteStart;
  playbackManager._infiniteEndCol = range.infiniteEnd;
  if (range.repeatEnd === null) playbackManager._repeatTaken = false;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {boolean}
 */
export function calcRangeHelper(playbackManager, objectManager) {
  const range = computeRange(playbackManager, objectManager);
  if (!range) return false;
  applyRange(playbackManager, range);
  return true;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {void}
 */
export function updateRangeHelper(playbackManager, objectManager) {
  if (objectManager.objects.size === 0) {
    playbackManager.stop();
    return;
  }

  const range = computeRange(playbackManager, objectManager);
  if (!range) {
    // 악기·도돌이표 없이 중단점만 남은 경우 등 재생할 범위가 없음
    playbackManager.stop();
    return;
  }

  applyRange(playbackManager, range);

  if (playbackManager._currentCol < range.loopStart) {
    playbackManager._currentCol = range.loopStart;
  }
  if (playbackManager._currentCol > range.loopEnd) {
    playbackManager._currentCol = range.loopStart;
  }
}
