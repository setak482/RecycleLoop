export function setupFloatingPanels() {
  document.querySelectorAll('.floating-panel').forEach(panel => {
    panel.querySelector('.panel-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
  });
}

export function setupGridToggle(grid) {
  const btn = document.getElementById('btn-grid');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const visible = grid.toggleGridLines();
    btn.textContent = visible ? '그리드 끄기' : '그리드 켜기';
  });
}

/**
 * 패널 컨트롤이 키보드 포커스를 가져가지 않게 막습니다.
 * 버튼에 포커스가 남으면 Space(선택 모드 토글)가 버튼을 다시 누르는 문제가 생깁니다.
 * - Tab 이동 차단: tabindex=-1
 * - 클릭 시 포커스 차단: 버튼류는 mousedown 기본동작 방지 (클릭 이벤트는 정상 발생)
 * - 슬라이더는 드래그에 mousedown이 필요하므로 조작이 끝나면 포커스만 해제
 */
export function preventControlFocus() {
  document.querySelectorAll('.floating-panel button, .floating-panel input, .panel-toggle')
    .forEach(el => { el.tabIndex = -1; });

  document.addEventListener('mousedown', e => {
    const el = e.target.closest('button, input[type="radio"], .instrument-item');
    if (el) e.preventDefault();
  });

  document.addEventListener('pointerup', () => {
    const active = document.activeElement;
    if (active && active.matches?.('button, input[type="range"], input[type="radio"]')) {
      active.blur();
    }
  });
}

export function setupSubdivisionControls(playback, grid, objects) {
  document.querySelectorAll('input[name="sub"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const value = e.target.value;
      playback.setSubdivision(value);
      grid.setSubdivision(value);
      objects.refreshDurationLines?.();
    });
  });
}
