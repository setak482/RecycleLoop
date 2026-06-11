import { DEFAULT_BPM, DEFAULT_SUB } from '../constants/config.js';
import { initHelper, initPlayheadHelper, movePlayheadHelper } from './helpers/initHelper.js';
import { calcRangeHelper, updateRangeHelper } from './helpers/rangeHelper.js';
import { triggerColHelper } from './helpers/triggerHelper.js';
import { ensureSamplerHelper } from './helpers/registerHelper.js';
import { startHelper, stopHelper } from './helpers/transportHelper.js';
import { previewNoteHelper } from './helpers/previewHelper.js';

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
    this._samplers = new Map(); // instrumentId → Tone.Sampler (악기별 공유)
    this._playhead = null;
    this._world = null;
    this._startCol = 0;          // 재생 시작 위치 (시작점 마커 반영)
    this._loopStartCol = 0;      // 타임라인이 되감기는 위치
    this._endCol = 0;            // 타임라인 끝 위치
    this._breakpointCol = null;  // 중단점 (도달 시 정지, null = 없음)
    this._repeatStartCol = null; // 도돌이표 시작 (null = 없음)
    this._repeatEndCol = null;   // 도돌이표 끝
    this._repeatTaken = false;   // 이번 바퀴에서 도돌이표를 이미 거쳤는지
    this._infiniteStartCol = null; // 무한 도돌이표 시작 (null = 없음)
    this._infiniteEndCol = null;   // 무한 도돌이표 끝
    this._currentCol = 0;
    this._Tone = null; // 동적 로드 후 저장
    this._lastObjectManager = null;
    this._stopPending = false;
    this._stopCol = null;
    this.subdivision = DEFAULT_SUB;
    this.masterVolume = 0;
    this.onPlaybackStateChange = null;
  }

  setPlaybackStateCallback(callback) {
    this.onPlaybackStateChange = callback;
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

  register(detail) {
    ensureSamplerHelper(this, detail);
  }

  previewNote(cellKey, detail) {
    previewNoteHelper(this, cellKey, detail)
      .catch(err => console.error('배치 미리듣기 재생 실패:', err));
  }

  async start(objectManager) {
    await startHelper(this, objectManager);
  }

  stop() {
    stopHelper(this);
  }

  stopAtMeasureBoundary() {
    stopHelper(this, { alignToBoundary: true });
  }

  toggle(objectManager) {
    if (!this._Tone || this._Tone.getTransport().state !== 'started') {
      this.start(objectManager);
    } else {
      this.stopAtMeasureBoundary();
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

  setVolume(db) {
    this.masterVolume = db;
    if (this._Tone) {
      this._Tone.Destination.volume.value = db;
    }
  }

  updateRange(objectManager) {
    updateRangeHelper(this, objectManager);
  }
}
