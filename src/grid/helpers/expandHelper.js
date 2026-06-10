import { CELL_W } from '../../constants/config.js';
import { buildCell } from './initGrid.js';
import { applySubdivisionMarkers } from './subdivisionHelper.js';

// 확장은 32열 단위로 — 4n/8n/16n/32n 모든 마디 경계와 정렬됩니다.
export const EXPAND_UNIT = 32;
// 가장 오른쪽 오브젝트 뒤로 항상 확보할 빈 공간(열).
export const EXPAND_BUFFER = 32;

function roundUpToUnit(cols) {
  return Math.ceil(cols / EXPAND_UNIT) * EXPAND_UNIT;
}

/**
 * 그리드 열 수를 targetCols 이상으로 늘립니다. (줄이지는 않음)
 * 새 열의 셀을 생성하고, 폭·마디선을 갱신합니다.
 *
 * @param {GridManager} grid
 * @param {number} targetCols - 최소로 필요한 열 수
 * @param {number} [maxCols] - 상한 (비정상 입력 방어)
 * @returns {boolean} 실제로 확장되었으면 true
 */
export function expandColumns(grid, targetCols, maxCols = Infinity) {
  const desired = Math.min(roundUpToUnit(targetCols), maxCols);
  if (desired <= grid.cols) return false;

  const oldCols = grid.cols;
  for (let r = 0; r < grid.rows; r++) {
    for (let c = oldCols; c < desired; c++) {
      buildCell(grid.world, grid.cells, r, c);
    }
  }

  grid.cols = desired;
  grid.world.style.gridTemplateColumns = `repeat(${desired}, ${CELL_W}px)`;
  applySubdivisionMarkers(grid, grid.subdivision);
  return true;
}

/**
 * 오브젝트가 col 열에 놓일 때, 그 뒤로 버퍼만큼 빈 공간이 남도록 확장합니다.
 * "오브젝트를 설치하면 그만큼 가용 마디가 늘어나는" 동작을 담당합니다.
 *
 * @param {GridManager} grid
 * @param {number} col
 * @param {number} [maxCols]
 * @returns {boolean}
 */
export function ensureColumnsForPlacement(grid, col, maxCols = Infinity) {
  return expandColumns(grid, col + 1 + EXPAND_BUFFER, maxCols);
}
