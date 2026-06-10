// src/main.js
import { GridManager }     from './grid/GridManager.js';
import { PlaybackManager } from './playback/PlaybackManager.js';
import { ObjectManager }   from './object/ObjectManager.js';

// ==========================================
// 1. 핵심 매니저 생성 및 초기화 (실행 영역)
// ==========================================
const grid     = new GridManager('grid-canvas');
const playback = new PlaybackManager();
const objects  = new ObjectManager(grid, playback);

grid.init();
objects.init();
playback.init(grid);

// UI 요소 및 이벤트 초기화 실행
setupUI(playback, objects);
loadInstrumentPanel();


// ==========================================
// 2. UI 세팅 및 이벤트 정의 (함수 정의 영역)
// ==========================================

/** 전체 UI 이벤트 리스너 등록 */
function setupUI(playback, objects) {
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

  // ── 박자(Subdivision) 라디오 버튼 제어 ──
  document.querySelectorAll('input[name="sub"]').forEach(radio => {
    radio.addEventListener('change', e => {
      playback.setSubdivision(e.target.value);
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
    item.setAttribute('draggable', true);
    item.dataset.id = inst.id;
    item.innerHTML = `<img src="/img/${inst.id}.png" alt="${inst.name}" /><span>${inst.name}</span>`;
    
    // 드래그 시작할 때 악기 ID를 전송 데이터에 세팅
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('instrumentId', inst.id);
    });
    
    list.appendChild(item);
  });
}