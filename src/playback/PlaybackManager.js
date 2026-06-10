import { DEFAULT_BPM, DEFAULT_SUB } from '../constants/config.js';
import { initHelper, initPlayheadHelper, movePlayheadHelper } from './initHelper.js';
import { calcRangeHelper, updateRangeHelper } from './rangeHelper.js';
import { triggerColHelper } from './triggerHelper.js';
import { registerHelper, unregisterHelper } from './registerHelper.js';
import { startHelper, stopHelper } from './transportHelper.js';

/**
 * @class PlaybackManager
 * @description
 * 오디오 재생 루프와 플레이헤드를 관리하는 클래스입니다.
 * 객체 배치와 샘플을 기반으로 시퀀스를 실행하고 재생 상태를 토글합니다.
 */
export class PlaybackManager {
  constructor() {
    this.bpm = DEFAULT_BPM;
    this._loop = null;
    this._samplers = new Map();
    this._playhead = null;
    this._world = null;
    this._startCol = 0;
    this._endCol = 0;
    this._currentCol = 0;
    this._Tone = null; // 동적 로드 후 저장
    this._lastObjectManager = null;
    this.subdivision = DEFAULT_SUB;
  }

  init(gridManager) {
    initHelper(this, gridManager);
  }

  _initPlayhead() {
    initPlayheadHelper(this);
  }

  _movePlayhead(col) {
    movePlayheadHelper(this, col);
  }

  _calcRange(objectManager) {
    return calcRangeHelper(this, objectManager);
  }

  _triggerCol(col, objectManager, time) {
    triggerColHelper(this, col, objectManager, time);
  }

  register(cellKey, detail) {
    registerHelper(this, cellKey, detail);
  }

  unregister(cellKey) {
    unregisterHelper(this, cellKey);
  }

  async start(objectManager) {
    await startHelper(this, objectManager);
  }

  stop() {
    stopHelper(this);
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
    updateRangeHelper(this, objectManager);
  }
}
