import { getMeasureInterval } from '../../grid/helpers/subdivisionHelper.js';

export function getDurationColumnCount(durationSeconds, bpm, subdivision) {
  if (!durationSeconds || durationSeconds <= 0) return 0;

  const interval = getMeasureInterval(subdivision);
  const secondsPerColumn = (60 / bpm) * (4 / interval);
  return Math.max(1, Math.floor(durationSeconds / secondsPerColumn)-1);
}

export function clearDurationLines(grid) {
  grid.clearMarks('duration');
}

export function renderDurationLines(grid, objects, bpm) {
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
      if (grid.getCell(targetKey)) grid.mark('duration', targetKey, true);
    }
  });
}
