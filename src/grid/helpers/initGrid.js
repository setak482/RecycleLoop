import { KEYS } from "../../constants/keys";
import { CELL_H, CELL_W } from "../../constants/config";

// 셀 상태만 생성 (DOM 없음) — 셀당 div를 만들던 방식을 대체
export function initCellState(manager) {
  for (let r = 0; r < manager.rows; r++) {
    for (let c = 0; c < manager.cols; c++) {
      manager.cells.set(`${c}-${r}`, { occupied: false, note: KEYS[r].note });
    }
  }
  console.log("Cell State Created.");
}

// 그리드 선/하이라이트를 그릴 배경 캔버스 생성 (뷰포트 크기 고정)
export function initBackgroundCanvas(manager) {
  const canvas = document.createElement('canvas');
  canvas.id = 'grid-bg';
  manager.canvas.insertBefore(canvas, manager.canvas.firstChild);
  manager._bg = { canvas, ctx: canvas.getContext('2d'), dpr: 1 };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    manager._bg.dpr = dpr;
    canvas.width  = manager.canvas.clientWidth * dpr;
    canvas.height = manager.canvas.clientHeight * dpr;
    manager.requestRender();
  };
  resize();
  window.addEventListener('resize', resize);
  console.log("Background Canvas Created.");
}

export function centerGrid(manager) {
  // 가로 중앙, 세로는 C4 행이 화면 중간에 오도록
  const c4RowIndex = KEYS.findIndex(k => k.note === 'C4');
  const x = ((manager.canvas.clientWidth - manager.labelWidth) - manager.cols * CELL_W) / 2 + manager.labelWidth;
  const y = (manager.canvas.clientHeight / 2) - (c4RowIndex * CELL_H);

  manager.world.style.left = `${manager.labelWidth}px`;
  manager._offset.x = x;
  manager._offset.y = y;
  manager._applyTransform();

  console.log('Grid Centered.')
}
