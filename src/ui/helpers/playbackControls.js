import { showToast } from '../Toast.js';

export function setupPlaybackControls(playback, objects) {
  const playBtn = document.getElementById('btn-play');
  playBtn?.addEventListener('click', () => {
    if (objects.getAll().length === 0) {
      showToast('배치된 오브젝트가 없습니다. 먼저 악기를 배치해주세요.');
      return;
    }

    playback.toggle(objects);
    setTimeout(() => {
      const isPlaying = playback._Tone?.getTransport().state === 'started';
      playBtn.classList.toggle('playing', isPlaying);
      document.getElementById('play-icon').textContent = isPlaying ? '⏹' : '▶';
    }, 100);
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

export function setupFileControls(playback, objects, selection, clearInstrumentState = () => {}) {
  const saveBtn = document.getElementById('btn-save');
  const loadBtn = document.getElementById('btn-load');
  const resetBtn = document.getElementById('btn-reset');
  const loadInput = document.getElementById('load-file-input');

  saveBtn?.addEventListener('click', () => {
    showToast('저장 인터페이스만 지원합니다. 실제 저장 기능은 아직 구현되지 않았습니다.');
  });

  loadBtn?.addEventListener('click', () => {
    loadInput?.click();
  });

  loadInput?.addEventListener('change', () => {
    if (loadInput.files?.length > 0) {
      showToast('불러오기 인터페이스만 지원합니다. 실제 불러오기 기능은 아직 구현되지 않았습니다.');
      loadInput.value = '';
    }
  });

  resetBtn?.addEventListener('click', () => {
    playback.stop();
    objects.reset();
    selection.reset();
    clearInstrumentState();
  });
}
