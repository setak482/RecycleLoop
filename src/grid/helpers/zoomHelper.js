export function applyTransform(manager) {
  manager.world.style.transform = `translate(${manager._offset.x}px, ${manager._offset.y}px) scale(${manager.scale})`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function setZoom(manager, scale, focusX, focusY) {
  const newScale = clamp(scale, manager.minScale, manager.maxScale);
  if (newScale === manager.scale) return;

  const prevScale = manager.scale;
  manager.scale = newScale;

  if (typeof focusX === 'number' && typeof focusY === 'number') {
    const rect = manager.canvas.getBoundingClientRect();
    const focusRelX = focusX - rect.left;
    const focusRelY = focusY - rect.top;
    const worldX = (focusRelX - manager._offset.x) / prevScale;
    const worldY = (focusRelY - manager._offset.y) / prevScale;
    const offsetX = focusRelX - worldX * newScale;
    const offsetY = focusRelY - worldY * newScale;
    manager._setOffset(offsetX, offsetY);
  } else {
    // _applyTransform을 거쳐야 가상 윈도(보이는 컬럼 범위)도 갱신됩니다.
    manager._applyTransform();
  }
}

export function zoomBy(manager, deltaY) {
  const direction = deltaY > 0 ? -1 : 1;
  const nextScale = manager.scale + direction * manager.scaleStep;
  const rect = manager.canvas.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  setZoom(manager, nextScale, centerX, centerY);
}
