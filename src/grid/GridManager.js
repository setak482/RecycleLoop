import { KEYS } from '../constants/keys.js';

import { setGridStyle, createCell, centerGrid } from './initGrid.js';
import { initPan }  from './initPan.js';

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

    this.rows = KEYS.length;
    this.cols = 64;
  }

  _setOffset(x, y) {
    this._offset = { x, y };
    this.world.style.transform = `translate(${x}px, ${y}px)`;
  }

  init() {
    setGridStyle(this.world, this.rows, this.cols);
    createCell(this.world, this.cells, this.rows, this.cols);
    initPan(this);
    centerGrid(this);
  }

  getCell(key)           { return this.cells.get(key); }
  isOccupied(key)        { return this.cells.get(key)?.occupied ?? false; }
  setOccupied(key, bool) {
    const cell = this.cells.get(key);
    if (!cell) return;
    cell.occupied = bool;
    cell.el.classList.toggle('occupied', bool);
  }
  highlight(key, bool)   { this.cells.get(key)?.el.classList.toggle('highlight', bool); }
}
