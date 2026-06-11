import { KEYS } from "../../constants/keys";
import { CELL_H, CELL_W } from "../../constants/config";

/**
 * 셀의 논리 상태만 Map에 채웁니다 (DOM 없음).
 * startCol부터 증분 생성할 수 있어 동적 확장(expandHelper)에서 재사용합니다.
 */
export function createCellStates(cellMap, rows, cols, startCol = 0) {
  for (let r = 0; r < rows; r++) {
    const note = KEYS[r].note;
    for (let c = startCol; c < cols; c++) {
      cellMap.set(`${c}-${r}`, { occupied: false, note });
    }
  }
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
  // 창 크기가 바뀌면 캔버스 해상도와 보이는 셀 범위를 다시 맞춥니다.
  window.addEventListener('resize', resize);
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
}
