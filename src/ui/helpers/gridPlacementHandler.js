export function setupGridPlacement(grid, objects, selection, getSelectedInstrumentId) {
  grid.world.addEventListener('click', async e => {
    if (grid._panMoved) {
      grid._panMoved = false;
      return;
    }

    const cell = e.target.closest('.grid-cell');
    if (!cell) return;

    if (selection.isPasteActive()) {
      e.preventDefault();
      await selection.commitPasteAt(cell.dataset.key);
      return;
    }

    if (selection.isSelectionMode()) {
      return;
    }

    const key = cell.dataset.key;
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
