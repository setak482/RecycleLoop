export function setupGridPlacement(grid, objects, selection, getSelectedInstrumentId) {
  grid.world.addEventListener('click', async e => {
    if (grid._panMoved) {
      grid._panMoved = false;
      return;
    }

    const key = grid.cellKeyFromPoint(e.clientX, e.clientY);
    if (!key) return;

    if (selection.isPasteActive()) {
      e.preventDefault();
      await selection.commitPasteAt(key);
      return;
    }

    if (selection.isSelectionMode()) {
      return;
    }

    if (objects.objects.has(key)) {
      objects.remove(key);
      return;
    }

    const selectedInstrumentId = getSelectedInstrumentId();
    if (selectedInstrumentId) {
      objects.place(selectedInstrumentId, key);
    }
  });
}
