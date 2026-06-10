import { showToast } from './Toast.js';
import { setupFloatingPanels, setupSubdivisionControls } from './helpers/uiPanelHelpers.js';
import { setupPlaybackControls, setupFileControls } from './helpers/playbackControls.js';
import { loadInstrumentPanel } from './helpers/instrumentPanel.js';
import { setupGridPlacement } from './helpers/gridPlacementHandler.js';

export function setupUI(playback, objects, selection, grid) {
  let selectedInstrumentId = null;
  let selectedInstrumentElement = null;

  setupFloatingPanels();
  setupPlaybackControls(playback, objects);
  setupFileControls(playback, objects, selection, () => {
    selectedInstrumentId = null;
    selectedInstrumentElement?.classList.remove('active');
    selectedInstrumentElement = null;
  });
  setupSubdivisionControls(playback, grid);
  setupGridPlacement(grid, objects, selection, () => selectedInstrumentId);

  loadInstrumentPanel((instId, element) => {
    if (selectedInstrumentId === instId) {
      selectedInstrumentId = null;
      selectedInstrumentElement?.classList.remove('active');
      selectedInstrumentElement = null;
      return;
    }

    selectedInstrumentElement?.classList.remove('active');
    selectedInstrumentId = instId;
    selectedInstrumentElement = element;
    element.classList.add('active');
  });
}
