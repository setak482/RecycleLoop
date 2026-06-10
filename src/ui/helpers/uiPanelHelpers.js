export function setupFloatingPanels() {
  document.querySelectorAll('.floating-panel').forEach(panel => {
    panel.querySelector('.panel-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
  });
}

export function setupSubdivisionControls(playback, grid) {
  document.querySelectorAll('input[name="sub"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const value = e.target.value;
      playback.setSubdivision(value);
      grid.setSubdivision(value);
    });
  });
}
