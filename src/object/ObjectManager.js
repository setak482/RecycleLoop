import { initHelper } from "./initHelper";
import { placeHelper } from "./placeHelper";
import { removeHelper } from "./removeHelper";
import { moveHelper } from "./moveHelper";

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
    return placeHelper(this, id, cellKey);
  }

  remove(cellKey) {
    removeHelper(this, cellKey);
  }

  move(fromKey, toKey) {
    moveHelper(this, fromKey, toKey);
  }

  getAll() {
    return [...this.objects.entries()];
  }
}
