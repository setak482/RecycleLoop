import { CELL_W } from '../../constants/config.js';
import { isMeasureBoundary } from './subdivisionHelper.js';

// 화면 양옆으로 여유 있게 유지할 컬럼 수 (팬 중 빈 화면 노출 방지)
const WINDOW_MARGIN = 12;

/**
 * 가상 윈도 렌더링: 화면에 보이는 컬럼 범위(±여유분)만 셀 DOM을 만들고,
 * 범위를 벗어난 컬럼의 DOM은 제거합니다. 셀의 논리 상태(점유·음높이)는
 * grid.cells Map에 항상 남아 있으므로, 다시 화면에 들어오면 상태로부터
 * 시각 표현(점유·마디선·지속선·배치 이미지·데코레이터)을 복원합니다.
 *
 * 팬/줌/확장 때마다 호출되며, 범위가 변하지 않으면 즉시 반환합니다.
 */
export function updateVirtualWindow(grid) {
  const canvasW = grid.canvas.clientWidth;
  if (!canvasW) return;

  // 캔버스 좌표 → 월드 좌표: world는 left:labelWidth + translate(offset) scale
  const worldLeft  = (0 - grid.labelWidth - grid._offset.x) / grid.scale;
  const worldRight = (canvasW - grid.labelWidth - grid._offset.x) / grid.scale;

  const start = Math.max(0, Math.floor(worldLeft / CELL_W) - WINDOW_MARGIN);
  const end   = Math.min(grid.cols, Math.ceil(worldRight / CELL_W) + WINDOW_MARGIN);
  if (start === grid.matStart && end === grid.matEnd) return;

  // 범위를 벗어난 컬럼 제거
  for (let c = grid.matStart; c < grid.matEnd; c++) {
    if (c < start || c >= end) dematerializeColumn(grid, c);
  }

  // 새로 들어온 컬럼 생성 (fragment 일괄 삽입)
  const fragment = document.createDocumentFragment();
  for (let c = start; c < end; c++) {
    if (c < grid.matStart || c >= grid.matEnd) materializeColumn(grid, c, fragment);
  }
  if (fragment.childNodes.length) grid.world.appendChild(fragment);

  grid.matStart = start;
  grid.matEnd = end;
}

function materializeColumn(grid, c, fragment) {
  const barLine = grid._markerInterval
    ? isMeasureBoundary(c, grid._markerInterval)
    : false;

  for (let r = 0; r < grid.rows; r++) {
    const key = `${c}-${r}`;
    const state = grid.cells.get(key);
    if (!state || state.el) continue;

    const el = document.createElement('div');
    el.className = 'grid-cell';
    el.dataset.key  = key;
    el.dataset.note = state.note;
    // 명시적 grid 좌표 — 생성 순서와 무관하게 올바른 위치에 놓입니다.
    el.style.gridColumn = c + 1;
    el.style.gridRow    = r + 1;

    if (state.occupied) el.classList.add('occupied');
    if (barLine) el.classList.add('bar-line');
    if (grid._durationLineKeys?.has(key)) el.classList.add('duration-line');

    // 이 셀에 배치된 오브젝트 이미지를 다시 붙입니다.
    const obj = grid.objectLookup?.(key);
    if (obj?.img) el.appendChild(obj.img);

    // 다른 모듈(선택 영역 등)이 등록한 시각 상태 복원 콜백
    grid.cellDecorators.forEach(fn => fn(key, el));

    state.el = el;
    fragment.appendChild(el);
  }
}

function dematerializeColumn(grid, c) {
  for (let r = 0; r < grid.rows; r++) {
    const state = grid.cells.get(`${c}-${r}`);
    if (!state?.el) continue;
    state.el.remove(); // 배치된 img는 ObjectManager가 참조를 유지하므로 유실되지 않음
    state.el = null;
  }
}
