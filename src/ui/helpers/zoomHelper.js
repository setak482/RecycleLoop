export function initZoomIndicator() {
  const container = document.getElementById('zoom-indicator');
  const valueEl = container?.querySelector('.zoom-value');
  const fillEl = container?.querySelector('.zoom-fill');

  if (!container || !valueEl || !fillEl) return null;

  return { container, valueEl, fillEl };
}

export function showZoomIndicator(indicator, percentage) {
  if (!indicator) return;

  const value = Math.round(percentage);
  indicator.valueEl.textContent = `${value}%`;
  indicator.fillEl.style.width = `${Math.min(100, Math.max(0, value))}%`;
  indicator.container.classList.add('active');
}

export function attachZoomWheel(grid, indicator) {
  if (!indicator) return;

  let hideTimer = null;

  function update(percentage) {
    showZoomIndicator(indicator, percentage);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      indicator.container.classList.remove('active');
    }, 900);
  }

  grid.canvas.addEventListener('wheel', e => {
    e.preventDefault();
    grid.zoomBy(e.deltaY);
    update(grid.scale * 100);
  });
}
