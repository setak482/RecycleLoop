import { initHelper } from './helpers/initHelper.js';
import { placeHelper } from './helpers/placeHelper.js';
import { removeHelper } from './helpers/removeHelper.js';
import { moveHelper } from './helpers/moveHelper.js';
// Dynamic grid expansion disabled; helper removed

/**
 * @class ObjectManager
 * @description
 * 그리드와 재생 관리자를 연계하여 객체의 배치, 이동, 삭제 상태를 관리합니다.
 * 각 셀을 키로 하여 현재 배치된 객체를 Map으로 저장합니다.
 */
export class ObjectManager {
  constructor(gridManager, playbackManager) {
    this.grid     = gridManager;
    this.playback = playbackManager;
    this.objects  = new Map();
  }

  init(){
    initHelper(this);
  }

  async place(id, cellKey) {
    const result = await placeHelper(this, id, cellKey);
    return result;
  }

  remove(cellKey) {
    removeHelper(this, cellKey);
  }

  reset() {
    const keys = [...this.objects.keys()];
    keys.forEach(key => {
      const obj = this.objects.get(key);
      if (!obj) return;
      obj.img.remove();
      this.grid.setOccupied(key, false);
      this.playback.unregister(key);
      this.objects.delete(key);
    });
    this.playback.updateRange(this);
  }

  move(fromKey, toKey) {
    moveHelper(this, fromKey, toKey);
  }

  getAll() {
    return [...this.objects.entries()];
  }
}
