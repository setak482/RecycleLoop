import { showToast } from './Toast.js';
import { setupFloatingPanels, setupSubdivisionControls, setupGridToggle, preventControlFocus } from './helpers/uiPanelHelpers.js';
import { setupPlaybackControls, setupFileControls } from './helpers/playbackControls.js';
import { setupHistoryControls } from './helpers/historyControls.js';
import { loadInstrumentPanel } from './helpers/instrumentPanel.js';
import { setupGridPlacement } from './helpers/gridPlacementHandler.js';

export function setupUI(playback, objects, selection, grid, history) {
  let selectedInstrumentId = null;
  let selectedInstrumentElement = null;

  setupFloatingPanels();
  setupPlaybackControls(playback, objects);
  setupFileControls(playback, objects, selection, grid, () => {
    selectedInstrumentId = null;
    selectedInstrumentElement?.classList.remove('active');
    selectedInstrumentElement = null;
  });
  setupSubdivisionControls(playback, grid, objects);
  setupGridToggle(grid);
  setupGridPlacement(grid, objects, selection, () => selectedInstrumentId);
  if (history) setupHistoryControls(history, selection);
  preventControlFocus();

  loadInstrumentPanel(async (instId, element, inst) => {
    // 선택 모드에서 블록이 선택된 상태로 악기를 클릭하면 일괄 악기 변경
    if (selection.isSelectionMode() && inst?.category !== 'marker') {
      const changed = await selection.changeSelectionInstrument(instId);
      if (changed) return;
    }

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
