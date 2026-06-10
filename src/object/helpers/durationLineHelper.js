import { getMeasureInterval } from '../../grid/helpers/subdivisionHelper.js';

export function getDurationColumnCount(durationSeconds, bpm, subdivision) {
  if (!durationSeconds || durationSeconds <= 0) return 0;

  const interval = getMeasureInterval(subdivision);
  const secondsPerColumn = (60 / bpm) * (4 / interval);
  return Math.max(1, Math.floor(durationSeconds / secondsPerColumn)-1);
}

// 지속선이 그려진 셀 키를 추적해 두면 클리어 시 전체 셀(1만 개 이상)을
// 순회하지 않고 표시된 셀만 지울 수 있습니다.
export function clearDurationLines(grid) {
  if (!grid._durationLineKeys) return;
  grid._durationLineKeys.forEach(key => {
    grid.getCell(key)?.el?.classList.remove('duration-line');
  });
  grid._durationLineKeys.clear();
}

export function renderDurationLines(grid, objects, bpm) {
  if (!grid._durationLineKeys) grid._durationLineKeys = new Set();
  clearDurationLines(grid);
  const subdivision = grid.subdivision;

  objects.forEach(({ detail }, cellKey) => {
    if (!detail || typeof detail.duration !== 'number' || detail.duration <= 0) return;
    const [colString, rowString] = cellKey.split('-');
    const col = parseInt(colString, 10);
    const row = parseInt(rowString, 10);
    const durationColumns = getDurationColumnCount(detail.duration, bpm, subdivision);

    for (let step = 1; step <= durationColumns; step += 1) {
      const targetCol = col + step;
      if (targetCol >= grid.cols) break;
      const targetKey = `${targetCol}-${row}`;
      const cell = grid.getCell(targetKey);
      if (!cell) continue;
      // 화면 밖 셀(el null)도 키는 기록 — 가상 윈도 생성 시 복원됩니다.
      cell.el?.classList.add('duration-line');
      grid._durationLineKeys.add(targetKey);
    }
  });
}
