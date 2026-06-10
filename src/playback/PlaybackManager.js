import { KEYS } from '../constants/keys.js';
import { CELL_W, DEFAULT_BPM, DEFAULT_SUB } from '../constants/config.js';

export class PlaybackManager {
  constructor() {
    this.bpm         = 120;
    this._loop       = null;
    this._samplers   = new Map();
    this._playhead   = null;
    this._world      = null;
    this._startCol   = 0;
    this._endCol     = 0;
    this._currentCol = 0;
    this._Tone       = null; // 동적 로드 후 저장
    this.subdivision = '16n';
  }

  init(gridManager) {
    this._world = gridManager.world;
    console.log('PlaybackManager init, world:', this._world); // 확인용
    this._initPlayhead();
  }

  _initPlayhead() {
    this._playhead = document.createElement('div');
    this._playhead.id = 'playhead';
    this._world.appendChild(this._playhead);
  }

  _movePlayhead(col) {
    if (!this._playhead) return;
    this._playhead.style.transform = `translateX(${col * CELL_W}px)`;
  }


  _calcRange(objectManager) {
    if (objectManager.objects.size === 0) return false;
    const cols = [...objectManager.objects.keys()]
      .map(key => parseInt(key.split('-')[0]));
    this._startCol = Math.min(...cols);
    this._endCol   = Math.max(...cols);
    return true;
  }

  // _triggerCol — role 체크 대신 sampler 존재 여부로만 판단
  _triggerCol(col, objectManager, time) {
    objectManager.objects.forEach((obj, cellKey) => {
      if (parseInt(cellKey.split('-')[0]) !== col) return;

      // sampler 없으면 (rest 포함) 소리 없이 애니메이션만
      const sampler = this._samplers.get(cellKey);
      if (sampler?.loaded) {
        const rowIndex = parseInt(cellKey.split('-')[1]);
        const note = KEYS[rowIndex].note;
        const dur = obj.detail.duration ?? 1;
        sampler.triggerAttackRelease(note, dur, time);
      }

      obj.img.classList.remove('triggered');
      void obj.img.offsetWidth;
      obj.img.classList.add('triggered');
      setTimeout(() => obj.img.classList.remove('triggered'), 300);
    });
  }





  // register — null 체크만 확실히
  register(cellKey, detail) {
    console.log("들어온 sample 값:", detail.sample);
    if (!detail || !detail.sample || !detail.sample.notes || Object.keys(detail.sample.notes).length === 0) {
      return;
    }
    if (!this._Tone) return;
    const jsonVolume = detail.volume ?? 0; 
    const sampler = new this._Tone.Sampler({
      urls: detail.sample.notes,
      volume: jsonVolume,
    }).toDestination();
    this._samplers.set(cellKey, sampler);
  }



  unregister(cellKey) {
    const sampler = this._samplers.get(cellKey);
    if (!sampler) return;
    sampler.dispose();
    this._samplers.delete(cellKey);
  }

  async start(objectManager) {
    // ── Tone.js 최초 1회 동적 로드 ─────────────────────
    if (!this._Tone) {
      this._Tone = await import('tone');
    }
    const Tone = this._Tone;

    await Tone.start(); // 유저 클릭 이후라 허용됨
    Tone.getTransport().bpm.value = this.bpm;

    if (!this._calcRange(objectManager)) {
      console.warn('배치된 오브젝트 없음');
      return;
    }

    // 기존에 등록 못 한 sampler 일괄 등록
    objectManager.objects.forEach((obj, cellKey) => {
      if (!obj.detail || !obj.detail.sample || !obj.detail.sample.notes) return;
      if (!this._samplers.has(cellKey)) {
        const sampler = new Tone.Sampler({
          urls: obj.detail.sample.notes,
        }).toDestination();
        this._samplers.set(cellKey, sampler);
      }
    });

    this._currentCol = this._startCol;

    this._loop = new Tone.Sequence((time) => {
      this._triggerCol(this._currentCol, objectManager, time);
      this._movePlayhead(this._currentCol);
      this._currentCol = this._currentCol >= this._endCol
        ? this._startCol
        : this._currentCol + 1;
    }, [0], this.subdivision); // ← '4n' → '8n' or '16n

    this._loop.start(0);
    Tone.getTransport().start();
  }

  stop() {
    if (!this._Tone) return;
    this._loop?.stop().dispose();
    this._loop = null;
    this._Tone.getTransport().stop();
    this._Tone.getTransport().position = 0;
    this._movePlayhead(this._startCol);
  }

  toggle(objectManager) {
    if (!this._Tone || this._Tone.getTransport().state !== 'started') {
      this.start(objectManager);
    } else {
      this.stop();
    }
  }
  setSubdivision(sub) {
    this.subdivision = sub;
    if (this._Tone?.getTransport().state === 'started') {
      this.stop();
      this.start(this._lastObjectManager);
    }
  }

  setBpm(bpm) {
    this.bpm = bpm;
    if (this._Tone) this._Tone.getTransport().bpm.value = bpm;
  }

  updateRange(objectManager) {
    if (objectManager.objects.size === 0) {
      this.stop();
      return;
    }
    const cols = [...objectManager.objects.keys()]
      .map(key => parseInt(key.split('-')[0]));
    this._startCol = Math.min(...cols);
    this._endCol   = Math.max(...cols);

    // 현재 플레이헤드가 범위 밖이면 보정
    if (this._currentCol < this._startCol) this._currentCol = this._startCol;
    if (this._currentCol > this._endCol)   this._currentCol = this._startCol;
  }

}
