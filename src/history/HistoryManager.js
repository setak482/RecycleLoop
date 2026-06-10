const HISTORY_LIMIT = 100;

/**
 * @class HistoryManager
 * @description
 * 오브젝트 배치 상태의 스냅샷을 쌓아 실행 취소(Ctrl+Z)와 다시 실행(Ctrl+Y)을 지원합니다.
 * ObjectManager의 place/remove/move/reset이 끝날 때마다 commit()이 호출되고,
 * 붙여넣기·다중 삭제·불러오기 같은 일괄 작업은 beginBatch()/endBatch()로 묶어
 * 한 번의 undo 단위로 기록합니다.
 */
export class HistoryManager {
  constructor(objects) {
    this.objects = objects;
    this.undoStack = [];
    this.redoStack = [];
    this._current = [];
    this._applying = false;
    this._batchDepth = 0;
  }

  _snapshot() {
    return this.objects.getAll().map(([key, obj]) => ({ key, id: obj.id }));
  }

  _isSameSnapshot(a, b) {
    if (a.length !== b.length) return false;
    const map = new Map(a.map(o => [o.key, o.id]));
    return b.every(o => map.get(o.key) === o.id);
  }

  commit() {
    if (this._applying || this._batchDepth > 0) return;
    const snap = this._snapshot();
    if (this._isSameSnapshot(snap, this._current)) return;
    this.undoStack.push(this._current);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this._current = snap;
    this.redoStack.length = 0;
  }

  beginBatch() {
    this._batchDepth += 1;
  }

  endBatch() {
    this._batchDepth = Math.max(0, this._batchDepth - 1);
    if (this._batchDepth === 0) this.commit();
  }

  canUndo() {
    return this.undoStack.length > 0 && !this._applying;
  }

  canRedo() {
    return this.redoStack.length > 0 && !this._applying;
  }

  async undo() {
    if (!this.canUndo()) return false;
    const target = this.undoStack.pop();
    this.redoStack.push(this._current);
    await this._apply(target);
    this._current = target;
    return true;
  }

  async redo() {
    if (!this.canRedo()) return false;
    const target = this.redoStack.pop();
    this.undoStack.push(this._current);
    await this._apply(target);
    this._current = target;
    return true;
  }

  async _apply(snapshot) {
    this._applying = true;
    this.objects.beginBulk(); // 복원 중 오브젝트마다 렌더 갱신 방지
    try {
      const target = new Map(snapshot.map(o => [o.key, o.id]));
      for (const [key, obj] of this.objects.getAll()) {
        if (target.get(key) === obj.id) {
          target.delete(key);
        } else {
          this.objects.remove(key);
        }
      }
      for (const [key, id] of target) {
        await this.objects.place(id, key);
      }
    } finally {
      this.objects.endBulk();
      this._applying = false;
    }
  }
}
