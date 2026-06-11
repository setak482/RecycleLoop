export function clearSelection(grid, objects, selectionState) {
  selectionState.keys.forEach(key => {
    const obj = objects.objects.get(key);
    if (obj?.img) {
      obj.img.classList.remove('selected-object');
    }
  });
  grid.clearMarks('selected');
  selectionState.keys.clear();
}

export function updateSelectionKeys(keys, grid, objects, selectionState) {
  clearSelection(grid, objects, selectionState);
  keys.forEach(key => {
    if (!grid.getCell(key)) return;
    grid.mark('selected', key, true);
    selectionState.keys.add(key);

    const obj = objects.objects.get(key);
    if (obj?.img) {
      obj.img.classList.add('selected-object');
    }
  });
}

export function createSelectionBox(canvas) {
  const box = document.createElement('div');
  box.className = 'selection-box';
  box.style.display = 'none';
  canvas.appendChild(box);
  return box;
}

export function updateSelectionBox(selectionBox, x1, y1, x2, y2) {
  const rect = selectionBox.parentElement.getBoundingClientRect();
  const left = Math.min(x1, x2) - rect.left;
  const top = Math.min(y1, y2) - rect.top;
  const width = Math.abs(x1 - x2);
  const height = Math.abs(y1 - y2);

  selectionBox.style.display = 'block';
  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
}

export function hideSelectionBox(selectionBox) {
  selectionBox.style.display = 'none';
}

export function getCellKeyAtPoint(grid, clientX, clientY) {
  // 플로팅 패널 등 다른 UI 위에서는 무시 (기존 elementFromPoint 동작 유지)
  const el = document.elementFromPoint(clientX, clientY);
  if (!el || !grid.canvas.contains(el)) return null;
  return grid.cellKeyFromPoint(clientX, clientY);
}
