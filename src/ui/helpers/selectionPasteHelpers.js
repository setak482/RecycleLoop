export function startPastePreview(clipboard, pasteState) {
  pasteState.active = true;
  pasteState.items = clipboard ? [...clipboard] : [];
  pasteState.targetKey = null;
  clearPastePreview(pasteState);
}

export function clearPastePreview(pasteState) {
  pasteState.previewNodes.forEach(node => node.remove());
  pasteState.previewNodes = [];
  pasteState.targetKey = null;
}

export function updatePastePreview(targetKey, pasteState, grid) {
  if (!pasteState.active) return;
  if (pasteState.targetKey === targetKey) return;
  clearPastePreview(pasteState);
  pasteState.targetKey = targetKey;
  if (!targetKey) return;

  const [baseCol, baseRow] = parseCellKey(targetKey);
  pasteState.items.forEach(item => {
    const targetKeyInner = `${baseCol + item.offset.col}-${baseRow + item.offset.row}`;
    const targetCell = grid.getCell(targetKeyInner);
    if (!targetCell) return;
    const previewImg = document.createElement('img');
    previewImg.src = item.src;
    previewImg.alt = item.alt;
    previewImg.classList.add('placed-object', 'paste-preview-object');
    targetCell.el.appendChild(previewImg);
    pasteState.previewNodes.push(previewImg);
  });
}

export async function commitPaste(pasteState, grid, objects, showToast) {
  if (!pasteState.active || !pasteState.targetKey) {
    showToast('붙여넣을 위치를 선택하세요.');
    return;
  }

  const [baseCol, baseRow] = parseCellKey(pasteState.targetKey);
  let count = 0;

  for (const item of pasteState.items) {
    const targetCol = baseCol + item.offset.col;
    const targetRow = baseRow + item.offset.row;
    const targetKeyInner = `${targetCol}-${targetRow}`;
    if (!grid.getCell(targetKeyInner) || grid.isOccupied(targetKeyInner)) continue;
    await objects.place(item.id, targetKeyInner);
    count += 1;
  }

  clearPastePreview(pasteState);
  pasteState.active = false;
  showToast(`${count}개 붙여넣기 완료`);
}

function parseCellKey(key) {
  return key.split('-').map(Number);
}
