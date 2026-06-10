import { parseCellKey, getSelectionBounds } from './selectionKeyHelpers.js';

export function getMoveItems(selectionState, objects, grid) {
  const selectedKeys = [...selectionState.keys].filter(key => objects.objects.has(key));
  const bounds = getSelectionBounds(selectedKeys);
  if (!bounds) return null;
  return selectedKeys.map(key => {
    const obj = objects.objects.get(key);
    const [col, row] = parseCellKey(key);
    return {
      key,
      obj,
      col,
      row,
      offset: {
        col: col - bounds.minCol,
        row: row - bounds.minRow
      }
    };
  });
}

export function canMoveSelectionTo(baseCol, baseRow, selectionState, grid, objects) {
  const items = getMoveItems(selectionState, objects, grid);
  if (!items) return false;
  return items.every(item => {
    const targetCol = baseCol + item.offset.col;
    const targetRow = baseRow + item.offset.row;
    const targetKey = `${targetCol}-${targetRow}`;
    if (targetCol < 0 || targetRow < 0 || targetCol >= grid.cols || targetRow >= grid.rows) return false;
    if (!grid.getCell(targetKey)) return false;
    return !grid.isOccupied(targetKey) || selectionState.keys.has(targetKey);
  });
}

export async function moveSelectionTo(baseCol, baseRow, selectionState, objects, grid, showToast) {
  const items = getMoveItems(selectionState, objects, grid);
  if (!items) return false;
  if (!canMoveSelectionTo(baseCol, baseRow, selectionState, grid, objects)) {
    showToast('이동할 수 없는 위치입니다.');
    return false;
  }

  const deltaCol = baseCol - getSelectionBounds([...selectionState.keys]).minCol;
  const deltaRow = baseRow - getSelectionBounds([...selectionState.keys]).minRow;
  const movedItems = [...items].sort((a, b) => {
    if (deltaCol !== 0) return deltaCol > 0 ? b.col - a.col : a.col - b.col;
    return deltaRow > 0 ? b.row - a.row : a.row - b.row;
  });

  for (const item of movedItems) {
    const targetKey = `${baseCol + item.offset.col}-${baseRow + item.offset.row}`;
    objects.move(item.key, targetKey);
  }

  const newKeys = items.map(item => `${baseCol + item.offset.col}-${baseRow + item.offset.row}`);
  return newKeys;
}

export function clearMovePreview(grid, moveState) {
  moveState.previewKeys.forEach(key => {
    const cell = grid.getCell(key);
    if (cell) cell.el.classList.remove('move-preview');
  });
  moveState.previewKeys.clear();
}

export function highlightMovePreview(baseCol, baseRow, grid, objects, selectionState, moveState) {
  clearMovePreview(grid, moveState);
  const selectedKeys = [...selectionState.keys].filter(key => objects.objects.has(key));
  const bounds = getSelectionBounds(selectedKeys);
  if (!bounds) return;

  selectedKeys.forEach(key => {
    const [col, row] = parseCellKey(key);
    const offsetCol = col - bounds.minCol;
    const offsetRow = row - bounds.minRow;
    const targetKey = `${baseCol + offsetCol}-${baseRow + offsetRow}`;
    const cell = grid.getCell(targetKey);
    if (!cell) return;
    cell.el.classList.add('move-preview');
    moveState.previewKeys.add(targetKey);
  });
}
