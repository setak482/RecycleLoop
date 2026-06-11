import { CELL_W, CELL_H } from '../../constants/config.js';
import { getMeasureInterval } from './subdivisionHelper.js';

// 기존 grid.css의 셀 class 색상과 동일
const COLORS = {
  line:         'rgba(0, 0, 0, 0.04)',
  barLine:      'rgba(12, 64, 150, 0.24)',
  occupied:     'rgba(80, 140, 255, 0.08)',
  durationBg:   'rgba(255, 160, 0, 0.08)',
  durationLine: 'rgba(255, 160, 0, 0.8)',
  selected:     'rgba(76, 140, 255, 0.18)',
  movePreview:  'rgba(34, 197, 94, 0.22)',
  hover:        'rgba(80, 140, 255, 0.25)',
};

function parseKey(key) {
  const sep = key.indexOf('-');
  return [Number(key.slice(0, sep)), Number(key.slice(sep + 1))];
}

// 보이는 범위 안의 마킹된 셀들만 채움
function fillCells(ctx, keys, color, range) {
  if (!keys.size) return;
  ctx.fillStyle = color;
  keys.forEach(key => {
    const [col, row] = parseKey(key);
    if (col < range.colStart || col >= range.colEnd) return;
    if (row < range.rowStart || row >= range.rowEnd) return;
    ctx.fillRect(col * CELL_W, row * CELL_H, CELL_W, CELL_H);
  });
}

/**
 * 배경 캔버스에 그리드를 그립니다.
 * 월드 좌표계로 변환한 뒤, 현재 뷰포트에 보이는 셀 범위만 그립니다.
 */
export function renderGrid(manager) {
  const bg = manager._bg;
  if (!bg) return;

  const { ctx, canvas, dpr } = bg;
  const { scale, _offset: offset, cols, rows } = manager;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // CSS transform(left: labelWidth + translate + scale)과 동일한 매핑
  const originX = manager.labelWidth + offset.x;
  const originY = offset.y;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * originX, dpr * originY);

  // 보이는 셀 범위 계산
  const viewW = canvas.width / dpr;
  const viewH = canvas.height / dpr;
  const colStart = Math.max(0, Math.floor(-originX / scale / CELL_W));
  const colEnd   = Math.min(cols, Math.ceil((viewW - originX) / scale / CELL_W));
  const rowStart = Math.max(0, Math.floor(-originY / scale / CELL_H));
  const rowEnd   = Math.min(rows, Math.ceil((viewH - originY) / scale / CELL_H));
  if (colStart >= colEnd || rowStart >= rowEnd) return;

  const range = { colStart, colEnd, rowStart, rowEnd };

  // 1. 셀 배경 (기존 class 우선순위 순서대로 덧칠)
  fillCells(ctx, manager.occupiedKeys,      COLORS.occupied,    range);
  fillCells(ctx, manager.marks.duration,    COLORS.durationBg,  range);
  fillCells(ctx, manager.marks.selected,    COLORS.selected,    range);
  fillCells(ctx, manager.marks.movePreview, COLORS.movePreview, range);
  fillCells(ctx, manager.marks.hover,       COLORS.hover,       range);

  // 2. 지속선 (duration 셀의 오른쪽 경계선)
  if (manager.marks.duration.size) {
    ctx.strokeStyle = COLORS.durationLine;
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    manager.marks.duration.forEach(key => {
      const [col, row] = parseKey(key);
      if (col < colStart || col >= colEnd || row < rowStart || row >= rowEnd) return;
      const x = (col + 1) * CELL_W;
      ctx.moveTo(x, row * CELL_H);
      ctx.lineTo(x, (row + 1) * CELL_H);
    });
    ctx.stroke();
  }

  // 3. 그리드 선 (토글로 숨김 가능)
  if (!manager.showGridLines) return;

  const top = rowStart * CELL_H;
  const bottom = rowEnd * CELL_H;
  const left = colStart * CELL_W;
  const right = colEnd * CELL_W;
  const interval = getMeasureInterval(manager.subdivision);

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1 / scale;
  ctx.beginPath();
  for (let c = colStart + 1; c <= colEnd; c++) {
    if (c % interval === 0) continue; // 마디선은 별도 패스에서
    const x = c * CELL_W;
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let r = rowStart + 1; r <= rowEnd; r++) {
    const y = r * CELL_H;
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();

  // 4. 마디선 (분할 단위 경계마다 굵은 선)
  ctx.strokeStyle = COLORS.barLine;
  ctx.lineWidth = 2 / scale;
  ctx.beginPath();
  for (let c = colStart + 1; c <= colEnd; c++) {
    if (c % interval !== 0) continue;
    const x = c * CELL_W;
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  ctx.stroke();
}
