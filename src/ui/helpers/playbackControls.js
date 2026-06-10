import { saveAs } from 'file-saver';
import { showToast } from '../Toast.js';
import { serializeProject, parseProject, makeProjectFileName } from '../../io/projectIO.js';

export function setupPlaybackControls(playback, objects) {
  const playBtn = document.getElementById('btn-play');
  playBtn?.addEventListener('click', () => {
    const playable = objects.getAll().filter(([, obj]) => !obj.detail?.marker);
    if (playable.length === 0) {
      showToast('배치된 오브젝트가 없습니다. 먼저 악기를 배치해주세요.');
      return;
    }

    // 버튼 상태는 아래 setPlaybackStateCallback에서 갱신됩니다.
    playback.toggle(objects);
  });

  const bpmInput = document.getElementById('btn-bpm');
  const bpmLabel = document.getElementById('bpm-label');
  bpmInput?.addEventListener('input', e => {
    const bpm = parseInt(e.target.value, 10);
    playback.setBpm(bpm);
    if (bpmLabel) bpmLabel.textContent = `${bpm} BPM`;
  });

  const volumeInput = document.getElementById('btn-volume');
  const volumeLabel = document.getElementById('volume-label');
  volumeInput?.addEventListener('input', e => {
    const volume = parseInt(e.target.value, 10);
    playback.setVolume?.(volume);
    if (volumeLabel) volumeLabel.textContent = `${volume} dB`;
  });

  playback.setPlaybackStateCallback?.((state) => {
    const isPlaying = state === 'started';
    playBtn?.classList.toggle('playing', isPlaying);
    document.getElementById('play-icon').textContent = isPlaying ? '⏹' : '▶';
  });
}

export function setupFileControls(playback, objects, selection, grid, clearInstrumentState = () => {}) {
  const saveBtn = document.getElementById('btn-save');
  const loadBtn = document.getElementById('btn-load');
  const resetBtn = document.getElementById('btn-reset');
  const loadInput = document.getElementById('load-file-input');

  saveBtn?.addEventListener('click', () => {
    const project = serializeProject(playback, objects);
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    saveAs(blob, makeProjectFileName());
    showToast(`저장 완료 (오브젝트 ${project.objects.length}개)`);
  });

  loadBtn?.addEventListener('click', () => {
    loadInput?.click();
  });

  loadInput?.addEventListener('change', async () => {
    const file = loadInput.files?.[0];
    loadInput.value = '';
    if (!file) return;

    let project;
    try {
      project = parseProject(await file.text());
    } catch (err) {
      showToast(err.message ?? '불러오기에 실패했습니다.');
      return;
    }

    playback.stop();
    selection.reset();
    clearInstrumentState();
    applyProjectSettings(project, playback, grid, objects);

    // 가장 오른쪽 오브젝트 + 배치 버퍼까지 한 번에 확장해 두어
    // 루프 도중 그리드 확장(셀 수천 개 생성 + 전체 레이아웃)을 막습니다.
    const maxCol = project.objects.reduce((max, { cell }) => {
      const col = parseInt(cell.split('-')[0], 10);
      return Number.isInteger(col) && col > max ? col : max;
    }, 0);
    grid.ensureColumnsForPlacement(maxCol);

    // 불러오기 전체를 한 번의 undo 단위 + 한 번의 렌더 갱신으로 묶음
    objects.beginBulk();
    try {
      objects.reset();
      for (const { cell, id } of project.objects) {
        if (grid.getCell(cell)) await objects.place(id, cell);
      }
    } finally {
      objects.endBulk();
    }

    showToast(`불러오기 완료 (오브젝트 ${objects.getAll().length}개)`);
  });

  resetBtn?.addEventListener('click', () => {
    playback.stop();
    objects.reset();
    selection.reset();
    clearInstrumentState();
  });
}

function applyProjectSettings(project, playback, grid, objects) {
  if (project.bpm !== null) {
    playback.setBpm(project.bpm);
    const bpmInput = document.getElementById('btn-bpm');
    const bpmLabel = document.getElementById('bpm-label');
    if (bpmInput) bpmInput.value = project.bpm;
    if (bpmLabel) bpmLabel.textContent = `${project.bpm} BPM`;
  }

  if (project.volume !== null) {
    playback.setVolume?.(project.volume);
    const volumeInput = document.getElementById('btn-volume');
    const volumeLabel = document.getElementById('volume-label');
    if (volumeInput) volumeInput.value = project.volume;
    if (volumeLabel) volumeLabel.textContent = `${project.volume} dB`;
  }

  if (project.subdivision !== null) {
    playback.setSubdivision(project.subdivision);
    grid.setSubdivision(project.subdivision);
    objects.refreshDurationLines?.();
    const radio = document.querySelector(`input[name="sub"][value="${project.subdivision}"]`);
    if (radio) radio.checked = true;
  }
}
