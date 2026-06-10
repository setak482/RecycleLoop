import { KEYS } from "../../constants/keys";
import { CELL_H, CELL_W } from "../../constants/config";

export function setGridStyle(worldElement, rows, cols){
    worldElement.style.gridTemplateColumns = `repeat(${cols}, ${CELL_W}px)`;
    worldElement.style.gridTemplateRows    = `repeat(${rows}, ${CELL_H}px)`;
}

/**
 * 셀의 논리 상태만 Map에 채웁니다. 셀 DOM은 가상 윈도(virtualWindow.js)가
 * 화면에 보이는 컬럼 범위만 생성하므로 여기서는 만들지 않습니다.
 */
export function createCellStates(cellMap, rows, cols, startCol = 0) {
  for (let r = 0; r < rows; r++) {
    const note = KEYS[r].note;
    for (let c = startCol; c < cols; c++) {
      cellMap.set(`${c}-${r}`, { el: null, occupied: false, note });
    }
  }
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
