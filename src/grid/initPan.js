export function initPan(ctx) {
    let dragging = false;
    let startX, startY, startOffsetX, startOffsetY;

    ctx.canvas.addEventListener('mousedown', e => {
        if (e.target.closest('.placed-object')) return;
        if (e.target.closest('.instrument-item')) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startOffsetX = ctx._offset.x;
        startOffsetY = ctx._offset.y;
        ctx.canvas.classList.add('panning');
    });

    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        ctx._setOffset(
        startOffsetX + (e.clientX - startX),
        startOffsetY + (e.clientY - startY)
        );
    });

    window.addEventListener('mouseup', () => {
        dragging = false;
        ctx.canvas.classList.remove('panning');
    });

    console.log("Pan Initialized.")
}