// src/main.js
import { GridManager }     from './grid/GridManager.js';
import { PlaybackManager } from './playback/PlaybackManager.js';
import { ObjectManager }   from './object/ObjectManager.js';
import { attachZoomWheel, initZoomIndicator } from './ui/helpers/zoomHelper.js';

// ==========================================
// 1. 핵심 매니저 생성 및 초기화 (실행 영역)
// ==========================================
const grid     = new GridManager('grid-canvas');
const playback = new PlaybackManager();
const objects  = new ObjectManager(grid, playback);

let selectedInstrumentId = null;
let selectedInstrumentElement = null;

grid.init();
objects.init();
playback.init(grid);

const zoomIndicator = initZoomIndicator();
attachZoomWheel(grid, zoomIndicator);

// UI 요소 및 이벤트 초기화 실행
setupUI(playback, objects, grid);
loadInstrumentPanel();

grid.world.addEventListener('click', e => {
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;

  const key = cell.dataset.key;
  if (objects.objects.has(key)) {
    objects.remove(key);
    return;
  }

  if (selectedInstrumentId) {
    objects.place(selectedInstrumentId, key);
  }
});


// ==========================================
// 2. UI 세팅 및 이벤트 정의 (함수 정의 영역)
// ==========================================

/** 전체 UI 이벤트 리스너 등록 */
function setupUI(playback, objects, grid) {
  // ── 패널 열고 닫기 토글 ──
  document.querySelectorAll('.floating-panel').forEach(panel => {
    panel.querySelector('.panel-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
  });

  // ── 재생 버튼 제어 ──
  const playBtn = document.getElementById('btn-play');
  playBtn?.addEventListener('click', () => {
    playback.toggle(objects);
    
    // 재생 상태 반영 (약간의 딜레이 후 버튼 UI 토글)
    setTimeout(() => {
      const isPlaying = playback._Tone?.getTransport().state === 'started';
      playBtn.classList.toggle('playing', isPlaying);
      document.getElementById('play-icon').textContent = isPlaying ? '⏹' : '▶';
    }, 100);
  });

  // ── BPM 슬라이더 제어 ──
  const bpmSlider = document.getElementById('btn-bpm');
  const bpmLabel  = document.getElementById('bpm-label');
  bpmSlider?.addEventListener('input', e => {
    const bpm = Number(e.target.value);
    bpmLabel.textContent = `${bpm} BPM`;
    playback.setBpm(bpm);
  });

  // ── 저장 / 불러오기 / 초기화 버튼 ──
  const saveBtn = document.getElementById('btn-save');
  const loadBtn = document.getElementById('btn-load');
  const resetBtn = document.getElementById('btn-reset');
  const loadInput = document.getElementById('load-file-input');

  saveBtn?.addEventListener('click', () => {
    alert('저장 인터페이스만 지원합니다. 실제 저장 기능은 아직 구현되지 않았습니다.');
  });

  loadBtn?.addEventListener('click', () => {
    loadInput?.click();
  });

  loadInput?.addEventListener('change', () => {
    if (loadInput.files?.length > 0) {
      alert('불러오기 인터페이스만 지원합니다. 실제 불러오기 기능은 아직 구현되지 않았습니다.');
      loadInput.value = ''; // 선택 초기화
    }
  });

  resetBtn?.addEventListener('click', () => {
    playback.stop();
    objects.reset();
  });

  // ── 박자(Subdivision) 라디오 버튼 제어 ──
  document.querySelectorAll('input[name="sub"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const value = e.target.value;
      playback.setSubdivision(value);
      grid.setSubdivision(value);
    });
  });
}

/** 악기 데이터 로드 및 사이드바 패널 생성 */
async function loadInstrumentPanel() {
  const { instruments } = await fetch('/src/data/instruments.json').then(r => r.json());
  const list = document.getElementById('instrument-list');
  
  instruments.forEach(inst => {
    const item = document.createElement('div');
    item.classList.add('instrument-item');
    item.dataset.id = inst.id;
    item.innerHTML = `<img src="/img/${inst.id}.png" alt="${inst.name}" /><span>${inst.name}</span>`;

    item.addEventListener('click', () => {
      if (selectedInstrumentId === inst.id) {
        selectedInstrumentId = null;
        selectedInstrumentElement?.classList.remove('active');
        selectedInstrumentElement = null;
      } else {
        if (selectedInstrumentElement) {
          selectedInstrumentElement.classList.remove('active');
        }
        selectedInstrumentId = inst.id;
        selectedInstrumentElement = item;
        item.classList.add('active');
      }
    });
    
    list.appendChild(item);
  });
}