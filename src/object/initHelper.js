export function initHelper(manager){
    manager.grid.cells.forEach((cell, key) => {
    const el = cell.el;

    el.addEventListener('dragover', e => {
        e.preventDefault();
        e.currentTarget.classList.add('highlight');
    });

    el.addEventListener('dragleave', e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('highlight');
        }
    });

    el.addEventListener('drop', e => {
        e.preventDefault();
        e.currentTarget.classList.remove('highlight');

        const fromCell     = e.dataTransfer.getData('fromCell');
        const instrumentId = e.dataTransfer.getData('instrumentId');

        if (fromCell) {
            manager.move(fromCell, key);
        } else {
            manager.place(instrumentId, key);
        }
    });

    el.addEventListener('click', () => {
        if (manager.objects.has(key)) manager.remove(key);
    });
});
}