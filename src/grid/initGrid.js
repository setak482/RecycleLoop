import { KEYS } from "../constants/keys";
import { CELL_H, CELL_W } from "../constants/config";

export function setGridStyle(worldElement, rows, cols){
    worldElement.style.gridTemplateColumns = `repeat(${cols}, ${CELL_W}px)`;
    worldElement.style.gridTemplateRows    = `repeat(${rows}, ${CELL_H}px)`;
    console.log("Grid Style Set.");
}

export function createCell(worldElement, cellElement, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      const key  = `${c}-${r}`;

      cell.classList.add('grid-cell');
      if (KEYS[r].isBlack) cell.classList.add('black-key-row');
      if (KEYS[r].note.startsWith('C') && !KEYS[r].isBlack) cell.classList.add('c-row');
      cell.dataset.key  = key;
      cell.dataset.note = KEYS[r].note;

      cellElement.set(key, { el: cell, occupied: false, note: KEYS[r].note });
      worldElement.appendChild(cell);
    }
  }
  console.log("Cell Created.");
}

export function centerGrid(manager) {
// 가로 중앙, 세로는 C4 행이 화면 중간에 오도록
    const c4RowIndex = KEYS.findIndex(k => k.note === 'C4');
    const x = (manager.canvas.clientWidth  - manager.cols * CELL_W) / 2;
    const y = (manager.canvas.clientHeight / 2) - (c4RowIndex * CELL_H);
    manager._offset.x = x;
    manager._offset.y = y;
    manager.world.style.transform = `translate(${x}px, ${y}px)`;

    console.log("Grid Centered.")
}
