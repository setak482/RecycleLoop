import { KEYS } from '../constants/keys.js';
import { COLS, MAX_COLS, CELL_W, CELL_H } from '../constants/config.js';

import { createCellStates, initBackgroundCanvas, centerGrid } from './helpers/initGrid.js';
import { renderGrid } from './helpers/renderHelper.js';
import { expandColumns, ensureColumnsForPlacement } from './helpers/expandHelper.js';
import { initPan }  from './helpers/initPan.js';
import { applyTransform, setZoom, zoomBy } from './helpers/zoomHelper.js';
import { applySubdivisionMarkers } from './helpers/subdivisionHelper.js';
import { createRowLabels, updateRowLabelTransform } from './helpers/labelHelper.js';

/**
 * @class GridManager
 * @description
 * 그리드 렌더링과 셀 상태를 관리하는 클래스입니다.
 * 셀은 DOM 없이 상태(Map)로만 관리하고, 그리드 선과 셀 하이라이트는
 * 뷰포트 크기의 배경 캔버스에 보이는 영역만 그립니다.
 * (셀 DOM이 없으므로 화면 밖 셀의 시각 상태 복원·LOD 같은
 * 가상 윈도 보조 장치 없이도 팬/줌/확장 비용이 일정합니다.)
 */
export class GridManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.world  = document.getElementById('grid-world');
    this.cells  = new Map();   // "col-row" → { occupied, note }
    this._offset = { x: 0, y: 0 };

    // 줌 및 스케일 관련 초기값
    this.scale = 1;
    this.minScale = 0.3;
    this.maxScale = 2.0;
    this.scaleStep = 0.1;

    // 초기 그리드 크기 (행은 키 수에 맞춰 고정, 열은 동적으로 확장됨)
    this.rows = KEYS.length;
    this.cols = COLS;
    this.labelWidth = 64;
    // 기본 분할 단위 설정
    this.subdivision = '16n';
    // 그리드 선 표시 여부 (토글 버튼으로 제어)
    this.showGridLines = true;

    // 캔버스에 그리는 셀 시각 상태 (셀 div의 class 토글 대체)
    this.occupiedKeys = new Set();
    this.marks = {
      selected:    new Set(),
      movePreview: new Set(),
      duration:    new Set(),
      hover:       new Set(),
    };

    this._bg = null;            // { canvas, ctx, dpr }
    this._renderQueued = false;
  }

  _setOffset(x, y) {
    this._offset = { x, y };
    this._applyTransform();
  }

  _applyTransform() {
    applyTransform(this);
    updateRowLabelTransform(this);
    this.requestRender();
  }

  // rAF로 배칭된 배경 캔버스 다시 그리기
  // (mark()처럼 셀 단위로 여러 번 호출되는 경로를 한 프레임에 합칩니다)
  requestRender() {
    if (this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      renderGrid(this);
    });
  }

  setZoom(scale, focusX, focusY) {
    setZoom(this, scale, focusX, focusY);
  }

  zoomBy(deltaY, focusX, focusY) {
    zoomBy(this, deltaY, focusX, focusY);
  }

  // 셀 div가 없으므로 월드 크기를 직접 지정 (오브젝트/플레이헤드 배치 기준)
  _syncWorldSize() {
    this.world.style.width  = `${this.cols * CELL_W}px`;
    this.world.style.height = `${this.rows * CELL_H}px`;
  }

  init() {
    this._syncWorldSize();
    createCellStates(this.cells, this.rows, this.cols);
    initBackgroundCanvas(this);
    createRowLabels(this);
    initPan(this);
    centerGrid(this);
    applySubdivisionMarkers(this, this.subdivision);
  }

  setSubdivision(subdivision) {
    applySubdivisionMarkers(this, subdivision);
  }

  toggleGridLines() {
    this.showGridLines = !this.showGridLines;
    this.requestRender();
    return this.showGridLines;
  }

  // 오브젝트 배치 시 뒤쪽에 빈 마디를 확보하도록 그리드를 늘립니다.
  ensureColumnsForPlacement(col) {
    return ensureColumnsForPlacement(this, col, MAX_COLS);
  }

  // 저장 파일 로드 등에서 특정 열까지 셀이 존재하도록 보장합니다.
  ensureColumns(minCols) {
    return expandColumns(this, minCols, MAX_COLS);
  }

  /**
   * 화면 좌표 → 셀 키 변환 (셀 div 히트테스트 대체)
   * @returns {string|null} "col-row" 또는 그리드 밖이면 null
   */
  cellKeyFromPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const worldX = (clientX - rect.left - this.labelWidth - this._offset.x) / this.scale;
    const worldY = (clientY - rect.top - this._offset.y) / this.scale;
    const col = Math.floor(worldX / CELL_W);
    const row = Math.floor(worldY / CELL_H);
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
    return `${col}-${row}`;
  }

  getCell(key)           { return this.cells.get(key); }
  isOccupied(key)        { return this.cells.get(key)?.occupied ?? false; }
  setOccupied(key, bool) {
    const cell = this.cells.get(key);
    if (!cell) return;
    cell.occupied = bool;
    if (bool) this.occupiedKeys.add(key);
    else this.occupiedKeys.delete(key);
    this.requestRender();
  }

  // 셀 시각 상태 마킹 (selected / movePreview / duration / hover)
  mark(type, key, bool) {
    const set = this.marks[type];
    if (!set) return;
    if (bool) set.add(key);
    else set.delete(key);
    this.requestRender();
  }

  clearMarks(type) {
    const set = this.marks[type];
    if (!set || !set.size) return;
    set.clear();
    this.requestRender();
  }

  highlight(key, bool) { this.mark('hover', key, bool); }
}
