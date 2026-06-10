export function initPan(manager) {
    let dragging = false;
    let startX, startY, startOffsetX, startOffsetY;

    manager.canvas.addEventListener('mousedown', e => {
        if (e.target.closest('.placed-object')) return;
        if (e.target.closest('.instrument-item')) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startOffsetX = manager._offset.x;
        startOffsetY = manager._offset.y;
        manager.canvas.classList.add('panning');
    });

    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        manager._setOffset(
        startOffsetX + (e.clientX - startX),
        startOffsetY + (e.clientY - startY)
        );
    });

    window.addEventListener('mouseup', () => {
        dragging = false;
        manager.canvas.classList.remove('panning');
    });

    console.log("Pan Initialized.")
}