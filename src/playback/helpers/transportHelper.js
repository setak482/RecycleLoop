import { triggerColHelper } from './triggerHelper.js';
import { calcRangeHelper } from './rangeHelper.js';
import { getMeasureInterval } from '../../grid/helpers/subdivisionHelper.js';

function getStopBoundaryCol(currentCol, interval) {
  const remainder = (currentCol + 1) % interval;
  return remainder === 0 ? currentCol : currentCol + (interval - remainder);
}

/**
 * 현재 열 재생 후 다음 열을 결정합니다. (우선순위 순)
 * - 무한 도돌이표 끝: 항상 시작 기호로 되감아 구간 무한 반복
 * - 도돌이표 끝에 처음 도달: 시작 기호로 한 번 되감기 (반복 1회)
 * - 타임라인 끝: 처음으로 되감고 반복 상태 초기화
 */
export function advanceColHelper(playbackManager) {
  const col = playbackManager._currentCol;

  if (playbackManager._infiniteEndCol !== null && col === playbackManager._infiniteEndCol) {
    return playbackManager._infiniteStartCol;
  }
  if (
    playbackManager._repeatEndCol !== null &&
    col === playbackManager._repeatEndCol &&
    !playbackManager._repeatTaken
  ) {
    playbackManager._repeatTaken = true;
    return playbackManager._repeatStartCol;
  }
  if (col >= playbackManager._endCol) {
    playbackManager._repeatTaken = false;
    return playbackManager._loopStartCol;
  }
  return col + 1;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {Promise<void>}
 */
export async function startHelper(playbackManager, objectManager) {
  if (!playbackManager._Tone) {
    playbackManager._Tone = await import('tone');
  }

  const Tone = playbackManager._Tone;
  await Tone.start();
  Tone.getTransport().bpm.value = playbackManager.bpm;

  if (!calcRangeHelper(playbackManager, objectManager)) {
    console.warn('배치된 오브젝트 없음');
    return;
  }

  objectManager.objects.forEach((obj, cellKey) => {
    if (!obj.detail || !obj.detail.sample || !obj.detail.sample.notes) return;
    if (!playbackManager._samplers.has(cellKey)) {
      const sampler = new Tone.Sampler({
        urls: obj.detail.sample.notes,
      }).toDestination();
      playbackManager._samplers.set(cellKey, sampler);
    }
  });

  playbackManager._currentCol = playbackManager._startCol;
  playbackManager._lastObjectManager = objectManager;
  playbackManager._stopPending = false;
  playbackManager._stopCol = null;
  playbackManager._repeatTaken = false;

  playbackManager._loop = new Tone.Sequence((time) => {
    const col = playbackManager._currentCol;
    triggerColHelper(playbackManager, col, objectManager, time);
    Tone.Draw.schedule(() => {
      playbackManager._movePlayhead(col);
    }, time);

    // 중단점에 도달하면 그 위치를 보여준 뒤 정지 (플레이헤드는 중단점에 남김)
    if (playbackManager._breakpointCol !== null && col === playbackManager._breakpointCol) {
      Tone.Draw.schedule(() => stopHelper(playbackManager, { keepPlayhead: true }), time);
      return;
    }

    if (playbackManager._stopPending && col === playbackManager._stopCol) {
      playbackManager._stopPending = false;
      playbackManager._stopCol = null;
      stopHelper(playbackManager);
      return;
    }

    playbackManager._currentCol = advanceColHelper(playbackManager);
  }, [0], playbackManager.subdivision);

  playbackManager._loop.start(0);
  Tone.getTransport().start();
  playbackManager.onPlaybackStateChange?.('started');
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {{ keepPlayhead?: boolean }} [options]
 *        keepPlayhead: 플레이헤드를 현재 위치에 둡니다 (중단점 정지용).
 * @returns {void}
 */
export function stopHelper(playbackManager, { keepPlayhead = false } = {}) {
  if (!playbackManager._Tone) return;

  const transport = playbackManager._Tone.getTransport();
  if (transport.state !== 'started') return;

  playbackManager._stopPending = false;
  playbackManager._stopCol = null;
  playbackManager._loop?.stop().dispose();
  playbackManager._loop = null;
  transport.stop();
  transport.position = 0;
  if (!keepPlayhead) {
    // 정지 후 실행될 예약된 플레이헤드 이동 콜백 제거 (시작 위치 복귀가 덮어써지지 않게)
    playbackManager._Tone.Draw.cancel();
    playbackManager._movePlayhead(playbackManager._startCol);
  }
  playbackManager.onPlaybackStateChange?.('stopped');
}
