export function initPan(manager) {
    let dragging = false;
    let startX, startY, startOffsetX, startOffsetY;
    const DRAG_THRESHOLD = 6;

    manager._panMoved = false;
    manager.selectionMode = false;

    manager.canvas.addEventListener('mousedown', e => {
        if (manager.selectionMode) return;
        if (e.target.closest('.placed-object')) return;
        if (e.target.closest('.instrument-item')) return;
        dragging = true;
        manager._panMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        startOffsetX = manager._offset.x;
        startOffsetY = manager._offset.y;
        manager.canvas.classList.add('panning');
    });

    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!manager._panMoved && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            manager._panMoved = true;
        }
        manager._setOffset(
            startOffsetX + dx,
            startOffsetY + dy
        );
    });

    window.addEventListener('mouseup', () => {
        dragging = false;
        manager.canvas.classList.remove('panning');
    });

    console.log('Pan Initialized.')
}