import { CELL_W } from '../../constants/config.js';
import { createCellStates } from './initGrid.js';
import { applySubdivisionMarkers } from './subdivisionHelper.js';
import { updateVirtualWindow } from './virtualWindow.js';

// 확장은 32열 단위로 — 4n/8n/16n/32n 모든 마디 경계와 정렬됩니다.
export const EXPAND_UNIT = 32;
// 가장 오른쪽 오브젝트 뒤로 항상 확보할 빈 공간(열).
export const EXPAND_BUFFER = 32;

function roundUpToUnit(cols) {
  return Math.ceil(cols / EXPAND_UNIT) * EXPAND_UNIT;
}

/**
 * 그리드 열 수를 targetCols 이상으로 늘립니다. (줄이지는 않음)
 * 셀의 논리 상태만 추가하고, DOM은 가상 윈도가 화면에 들어오는 컬럼만
 * 생성하므로 확장 자체는 수만 개 셀을 만들지 않아 매우 저렴합니다.
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
  createCellStates(grid.cells, grid.rows, desired, oldCols);

  grid.cols = desired;
  grid.world.style.gridTemplateColumns = `repeat(${desired}, ${CELL_W}px)`;
  applySubdivisionMarkers(grid, grid.subdivision);
  updateVirtualWindow(grid); // 새 영역이 현재 화면과 겹치면 즉시 생성
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
