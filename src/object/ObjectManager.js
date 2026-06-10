import { KEYS } from '../constants/keys.js';
import { initHelper } from './helpers/initHelper.js';
import { placeHelper } from './helpers/placeHelper.js';
import { removeHelper } from './helpers/removeHelper.js';
import { moveHelper } from './helpers/moveHelper.js';
import { renderDurationLines } from './helpers/durationLineHelper.js';
// Dynamic grid expansion disabled; helper removed

/**
 * @class ObjectManager
 * @description
 * 그리드와 재생 관리자를 연계하여 객체의 배치, 이동, 삭제 상태를 관리합니다.
 * 각 셀을 키로 하여 현재 배치된 객체를 Map으로 저장하며,
 * 재생 루프가 매 틱 전체 객체를 훑지 않도록 컬럼별 인덱스도 함께 유지합니다.
 */
export class ObjectManager {
  constructor(gridManager, playbackManager) {
    this.grid     = gridManager;
    this.playback = playbackManager;
    this.objects  = new Map();
    this.objectsByCol = new Map(); // col(number) → Map<cellKey, obj>
    this.history  = null;
    this._bulkDepth = 0;
    this._bulkDirty = false;
  }

  init(){
    initHelper(this);
  }

  setHistory(history) {
    this.history = history;
  }

  /**
   * 일괄 작업(불러오기·붙여넣기·다중 삭제/이동·undo) 구간을 선언합니다.
   * 구간 안에서는 배치/삭제마다 반복되던 지속선 재렌더와 재생 범위
   * 재계산(O(N²)의 원인)을 멈추고, 종료 시 한 번만 수행합니다.
   * 히스토리도 같은 구간을 하나의 undo 단위로 묶습니다.
   */
  beginBulk() {
    this._bulkDepth += 1;
    this.history?.beginBatch();
  }

  endBulk() {
    this.history?.endBatch();
    this._bulkDepth = Math.max(0, this._bulkDepth - 1);
    if (this._bulkDepth === 0 && this._bulkDirty) {
      this._bulkDirty = false;
      this.notifyChanged();
    }
  }

  isBulk() {
    return this._bulkDepth > 0;
  }

  // 배치 상태 변경 후 파생 상태(지속선·재생 범위)를 갱신합니다.
  notifyChanged() {
    if (this._bulkDepth > 0) {
      this._bulkDirty = true;
      return;
    }
    renderDurationLines(this.grid, this.objects, this.playback.bpm);
    this.playback.updateRange(this);
  }

  setObject(cellKey, obj) {
    const [col, row] = cellKey.split('-').map(Number);
    obj.col  = col;
    obj.note = KEYS[row]?.note ?? null;

    this.objects.set(cellKey, obj);
    let bucket = this.objectsByCol.get(col);
    if (!bucket) {
      bucket = new Map();
      this.objectsByCol.set(col, bucket);
    }
    bucket.set(cellKey, obj);
  }

  deleteObject(cellKey) {
    const obj = this.objects.get(cellKey);
    if (!obj) return;
    this.objects.delete(cellKey);
    const bucket = this.objectsByCol.get(obj.col);
    if (bucket) {
      bucket.delete(cellKey);
      if (bucket.size === 0) this.objectsByCol.delete(obj.col);
    }
  }

  getByCol(col) {
    return this.objectsByCol.get(col);
  }

  async place(id, cellKey, options = {}) {
    // 마커 교체(기존 제거 + 새 배치)가 undo 한 단위가 되도록 batch로 묶음
    this.history?.beginBatch();
    let result;
    try {
      result = await placeHelper(this, id, cellKey, options);
    } finally {
      this.history?.endBatch();
    }
    return result;
  }

  remove(cellKey) {
    removeHelper(this, cellKey);
    this.history?.commit();
  }

  reset() {
    this.objects.forEach((obj, key) => {
      obj.img.remove();
      this.grid.setOccupied(key, false);
    });
    this.objects.clear();
    this.objectsByCol.clear();
    this.notifyChanged();
    this.history?.commit();
  }

  move(fromKey, toKey, options = {}) {
    moveHelper(this, fromKey, toKey, options);
    this.history?.commit();
  }

  refreshDurationLines() {
    renderDurationLines(this.grid, this.objects, this.playback.bpm);
  }

  getAll() {
    return [...this.objects.entries()];
  }
}
