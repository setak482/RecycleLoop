export function initHelper(manager) {
  const world = manager.grid.world;
  let hoverKey = null;

  const setHover = (key) => {
    if (hoverKey === key) return;
    if (hoverKey) manager.grid.mark('hover', hoverKey, false);
    hoverKey = key;
    if (key) manager.grid.mark('hover', key, true);
  };

  world.addEventListener('dragover', e => {
    const key = manager.grid.cellKeyFromPoint(e.clientX, e.clientY);
    if (!key) return;

    e.preventDefault();
    setHover(key);
  });

  world.addEventListener('dragleave', e => {
    if (!world.contains(e.relatedTarget)) {
      setHover(null);
    }
  });

  world.addEventListener('drop', e => {
    const key = manager.grid.cellKeyFromPoint(e.clientX, e.clientY);
    if (!key) return;

    e.preventDefault();
    setHover(null);

    const fromCell = e.dataTransfer.getData('fromCell');
    const instrumentId = e.dataTransfer.getData('instrumentId');

    if (fromCell) {
      manager.move(fromCell, key, { preview: true });
    } else {
      manager.place(instrumentId, key, { preview: true });
    }
  });

  world.addEventListener('click', e => {
    const key = manager.grid.cellKeyFromPoint(e.clientX, e.clientY);
    if (!key) return;

    if (manager.objects.has(key)) {
      manager.remove(key);
    }
  });
}
