import { KEYS } from '../constants/keys.js';
import { COLS, MAX_COLS } from '../constants/config.js';

import { setGridStyle, createCellStates, centerGrid } from './helpers/initGrid.js';
import { expandColumns, ensureColumnsForPlacement } from './helpers/expandHelper.js';
import { updateVirtualWindow } from './helpers/virtualWindow.js';
import { initPan }  from './helpers/initPan.js';
import { applyTransform, setZoom, zoomBy } from './helpers/zoomHelper.js';
import { applySubdivisionMarkers } from './helpers/subdivisionHelper.js';
import { createRowLabels, updateRowLabelTransform } from './helpers/labelHelper.js';

/**
 * @class GridManager
 * @description
 * 그리드 렌더링과 셀 상태를 관리하는 클래스입니다.
 * 캔버스 요소와 그리드 월드를 초기화하고 셀별 점유 상태를 추적합니다.
 */
export class GridManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.world  = document.getElementById('grid-world');
    this.cells  = new Map();   // "col-row" → { el, occupied, note }
    this._offset = { x: 0, y: 0 };

    // 줌 및 스케일 관련 초기값
    this.scale = 1;
    this.minScale = 0.3;
    this.maxScale = 2.0;
    this.scaleStep = 0.1;

    // 초기 그리드 크기 (행은 키 수에 맞춰 고정, 열은 config.COLS로 관리)
    this.rows = KEYS.length;
    this.cols = COLS;
    this.labelWidth = 64;
    // 기본 분할 단위 설정
    this.subdivision = '16n';

    // 가상 윈도 렌더링: 현재 DOM이 존재하는 컬럼 범위 [matStart, matEnd)
    this.matStart = 0;
    this.matEnd = 0;
    // 셀이 다시 화면에 들어올 때 시각 상태를 복원하는 콜백 (key, el)
    this.cellDecorators = [];
    // cellKey → 배치된 오브젝트 (ObjectManager가 연결)
    this.objectLookup = null;
  }

  // dynamic grid extension removed

  _setOffset(x, y) {
    this._offset = { x, y };
    this._applyTransform();
  }

  // 브라우저가 mousemove/wheel을 이미 프레임 단위로 정렬해 주므로
  // 추가 rAF 배칭 없이 바로 씁니다 (배칭은 한 프레임 지연만 더함).
  _applyTransform() {
    applyTransform(this);
    updateRowLabelTransform(this);
    updateVirtualWindow(this);
  }

  setZoom(scale, focusX, focusY) {
    setZoom(this, scale, focusX, focusY);
  }

  zoomBy(deltaY, focusX, focusY) {
    zoomBy(this, deltaY, focusX, focusY);
  }

  init() {
    setGridStyle(this.world, this.rows, this.cols);
    createCellStates(this.cells, this.rows, this.cols);
    createRowLabels(this);
    initPan(this);
    centerGrid(this);
    applySubdivisionMarkers(this, this.subdivision);
    // 창 크기가 바뀌면 보이는 컬럼 범위도 달라집니다.
    window.addEventListener('resize', () => this._applyTransform());
  }

  setSubdivision(subdivision) {
    applySubdivisionMarkers(this, subdivision);
  }

  // 오브젝트 배치 시 뒤쪽에 빈 마디를 확보하도록 그리드를 늘립니다.
  ensureColumnsForPlacement(col) {
    return ensureColumnsForPlacement(this, col, MAX_COLS);
  }

  // 저장 파일 로드 등에서 특정 열까지 셀이 존재하도록 보장합니다.
  ensureColumns(minCols) {
    return expandColumns(this, minCols, MAX_COLS);
  }

  getCell(key)           { return this.cells.get(key); }
  isOccupied(key)        { return this.cells.get(key)?.occupied ?? false; }
  setOccupied(key, bool) {
    const cell = this.cells.get(key);
    if (!cell) return;
    cell.occupied = bool;
    cell.el?.classList.toggle('occupied', bool); // el은 화면 밖이면 null
  }
  highlight(key, bool)   { this.cells.get(key)?.el?.classList.toggle('highlight', bool); }
}
