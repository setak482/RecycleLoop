import { KEYS } from '../constants/keys.js';

import { setGridStyle, createCell, centerGrid } from './initGrid.js';
import { initPan }  from './initPan.js';

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
