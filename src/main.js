// src/main.js
import { GridManager }     from './grid/GridManager.js';
import { PlaybackManager } from './playback/PlaybackManager.js';
import { ObjectManager }   from './object/ObjectManager.js';

// ── 패널 토글 ──────────────────────────────────────────
document.querySelectorAll('.floating-panel').forEach(panel => {
  panel.querySelector('.panel-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
});

// ── 초기화 ────────────────────────────────────────────
const grid     = new GridManager('grid-canvas');
const playback = new PlaybackManager();
const objects  = new ObjectManager(grid, playback);

grid.init();
objects.init();
playback.init(grid); // Tone 건드리지 않음

// ── 악기 패널 ─────────────────────────────────────────
async function loadInstrumentPanel() {
  const { instruments } = await fetch('/src/data/instruments.json').then(r => r.json());
  const list = document.getElementById('instrument-list');
  instruments.forEach(inst => {
    const item = document.createElement('div');
    item.classList.add('instrument-item');
    item.setAttribute('draggable', true);
    item.dataset.id = inst.id;
    item.innerHTML = `<img src="/img/${inst.id}.png" alt="${inst.name}" /><span>${inst.name}</span>`;
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('instrumentId', inst.id);
    });
    list.appendChild(item);
  });
}
loadInstrumentPanel();

// ── 재생 버튼 ─────────────────────────────────────────
const playBtn   = document.getElementById('btn-play');
const bpmSlider = document.getElementById('btn-bpm');
const bpmLabel  = document.getElementById('bpm-label');

playBtn?.addEventListener('click', () => {
  playback.toggle(objects);
  // toggle이 async라 약간 딜레이 후 상태 반영
  setTimeout(() => {
    const isPlaying = playback._Tone?.getTransport().state === 'started';
    playBtn.classList.toggle('playing', isPlaying);
    document.getElementById('play-icon').textContent = isPlaying ? '⏹' : '▶';
  }, 100);
});

bpmSlider?.addEventListener('input', e => {
  const bpm = Number(e.target.value);
  bpmLabel.textContent = `${bpm} BPM`;
  playback.setBpm(bpm);
});

// main.js
document.querySelectorAll('input[name="sub"]').forEach(radio => {
  radio.addEventListener('change', e => {
    playback.setSubdivision(e.target.value);
  });
});

