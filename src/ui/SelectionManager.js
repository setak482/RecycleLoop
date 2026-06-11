import { showToast } from './Toast.js';
import {
  parseCellKey,
  getSelectionKeys,
  getSelectionBounds,
  getSelectionAnchor
} from './helpers/selectionKeyHelpers.js';
import {
  clearSelection as clearSelectionVisual,
  updateSelectionKeys as updateSelectionKeysVisual,
  createSelectionBox,
  updateSelectionBox,
  hideSelectionBox,
  getCellKeyAtPoint
} from './helpers/selectionRenderHelpers.js';
import {
  startPastePreview as startPastePreviewHelper,
  clearPastePreview as clearPastePreviewHelper,
  updatePastePreview as updatePastePreviewHelper,
  commitPaste as commitPasteHelper
} from './helpers/selectionPasteHelpers.js';
import {
  getMoveItems,
  canMoveSelectionTo,
  moveSelectionTo as moveSelectionToHelper,
  clearMovePreview as clearMovePreviewHelper,
  highlightMovePreview as highlightMovePreviewHelper
} from './helpers/selectionMoveHelpers.js';

export class SelectionManager {
  constructor(grid, objects) {
    this.grid = grid;
    this.objects = objects;

    this.selectionMode = false;
    this.selectionState = {
      active: false,
      startX: 0,
      startY: 0,
      startKey: null,
      currentKey: null,
      keys: new Set()
    };
    this.moveState = {
      active: false,
      hasMoved: false,
      startX: 0,
      startY: 0,
      anchorOffset: null,
      originBounds: null,
      currentBase: null,
      previewKeys: new Set()
    };
    this.pasteState = {
      active: false,
      items: [],
      targetKey: null,
      previewNodes: []
    };
    this.clipboard = null;
    this.selectionBox = null;
    this.DRAG_THRESHOLD = 6;
  }

  init() {
    this.selectionBox = createSelectionBox(this.grid.canvas);
    document.addEventListener('keydown', this.handleKeydown);
    this.grid.world.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  isSelectionMode() {
    return this.selectionMode;
  }

  isPasteActive() {
    return this.pasteState.active;
  }

  reset() {
    this.clearSelection();
    this.clearMovePreview();
    this.clearPastePreview();
    this.pasteState.active = false;
    this.selectionState.active = false;
    this.moveState.active = false;
  }

  handleKeydown = async (e) => {
    const targetTag = e.target?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'BUTTON') return;

    if (e.code === 'Space') {
      e.preventDefault();
      this.toggleSelectionMode();
      return;
    }

    if (!this.selectionMode) return;

    if (e.code === 'Delete') {
      e.preventDefault();
      this.deleteSelection();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
      e.preventDefault();
      this.copySelection();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {
      e.preventDefault();
      if (this.pasteState.active) {
        await this.commitPaste();
      }
      return;
    }

    if (e.code === 'Escape' && this.pasteState.active) {
      e.preventDefault();
      this.clearPastePreview();
      this.pasteState.active = false;
      showToast('붙여넣기 취소됨');
      return;
    }
  }

  handleMouseDown = (e) => {
    if (!this.selectionMode || e.button !== 0) return;
    if (this.pasteState.active) return;

    const key = this.grid.cellKeyFromPoint(e.clientX, e.clientY);
    if (!key) return;

    if (this.selectionState.keys.has(key) && this.selectionState.keys.size > 0) {
      this.moveState.active = true;
      this.moveState.hasMoved = false;
      this.moveState.startX = e.clientX;
      this.moveState.startY = e.clientY;
      this.moveState.originBounds = getSelectionBounds([...this.selectionState.keys]);
      const [col, row] = parseCellKey(key);
      this.moveState.anchorOffset = {
        col: col - this.moveState.originBounds.minCol,
        row: row - this.moveState.originBounds.minRow
      };
      this.moveState.currentBase = this.moveState.originBounds;
      e.preventDefault();
      return;
    }

    this.selectionState.active = true;
    this.selectionState.startX = e.clientX;
    this.selectionState.startY = e.clientY;
    this.selectionState.startKey = key;
    this.selectionState.currentKey = key;
    this.highlightSelection(this.selectionState.startKey, this.selectionState.currentKey);
    updateSelectionBox(this.selectionBox, e.clientX, e.clientY, e.clientX, e.clientY);
    e.preventDefault();
  }

  handleMouseMove = (e) => {
    if (this.pasteState.active) {
      const currentKey = getCellKeyAtPoint(this.grid, e.clientX, e.clientY);
      this.updatePastePreview(currentKey);
      return;
    }

    if (this.moveState.active) {
      const dx = e.clientX - this.moveState.startX;
      const dy = e.clientY - this.moveState.startY;
      if (!this.moveState.hasMoved && Math.sqrt(dx * dx + dy * dy) > this.DRAG_THRESHOLD) {
        this.moveState.hasMoved = true;
      }
      const currentKey = getCellKeyAtPoint(this.grid, e.clientX, e.clientY);
      if (currentKey && this.moveState.hasMoved) {
        const [col, row] = parseCellKey(currentKey);
        const baseCol = col - this.moveState.anchorOffset.col;
        const baseRow = row - this.moveState.anchorOffset.row;
        if (this.moveState.currentBase.minCol !== baseCol || this.moveState.currentBase.minRow !== baseRow) {
          this.moveState.currentBase = { minCol: baseCol, minRow: baseRow };
          clearMovePreviewHelper(this.grid, this.moveState);
          if (canMoveSelectionTo(baseCol, baseRow, this.selectionState, this.grid, this.objects)) {
            highlightMovePreviewHelper(baseCol, baseRow, this.grid, this.objects, this.selectionState, this.moveState);
          }
        }
      }
      return;
    }

    if (!this.selectionState.active) return;
    const currentKey = getCellKeyAtPoint(this.grid, e.clientX, e.clientY);
    if (currentKey && currentKey !== this.selectionState.currentKey) {
      this.selectionState.currentKey = currentKey;
      this.highlightSelection(this.selectionState.startKey, this.selectionState.currentKey);
    }
    updateSelectionBox(this.selectionBox, this.selectionState.startX, this.selectionState.startY, e.clientX, e.clientY);
  }

  handleMouseUp = async () => {
    if (this.pasteState.active) {
      return;
    }

    if (this.moveState.active) {
      if (this.moveState.hasMoved && this.moveState.currentBase) {
        const newKeys = await this.moveSelectionTo(this.moveState.currentBase.minCol, this.moveState.currentBase.minRow);
        if (newKeys) {
          updateSelectionKeysVisual(newKeys, this.grid, this.objects, this.selectionState);
        }
      }
      this.moveState.active = false;
      this.moveState.hasMoved = false;
      clearMovePreviewHelper(this.grid, this.moveState);
      return;
    }

    if (!this.selectionState.active) return;
    this.selectionState.active = false;
    hideSelectionBox(this.selectionBox);
  }

  commitPasteAt = async (targetKey) => {
    if (!this.pasteState.active) return;
    this.pasteState.targetKey = targetKey;
    await this.commitPaste();
  }

  toggleSelectionMode() {
    this.setSelectionMode(!this.selectionMode);
  }

  setSelectionMode(enabled) {
    this.selectionMode = enabled;
    this.grid.selectionMode = enabled;
    this.grid.canvas.classList.toggle('selection-mode', enabled);
    showToast(enabled ? '선택 모드 ON' : '선택 모드 OFF');
    if (!enabled) {
      this.clearSelection();
      this.clearMovePreview();
      this.clearPastePreview();
      this.pasteState.active = false;
      this.moveState.active = false;
    }
  }

  clearSelection() {
    clearSelectionVisual(this.grid, this.objects, this.selectionState);
  }

  updateSelectionKeys(keys) {
    updateSelectionKeysVisual(keys, this.grid, this.objects, this.selectionState);
  }

  highlightSelection(startKey, endKey) {
    const keys = getSelectionKeys(startKey, endKey).filter(key => this.objects.objects.has(key));
    this.updateSelectionKeys(keys);
  }

  copySelection() {
    const selectedKeys = [...this.selectionState.keys];
    if (!selectedKeys.length) {
      showToast('복사할 오브젝트가 없습니다.');
      return;
    }

    const anchor = getSelectionAnchor(selectedKeys);
    if (!anchor) {
      showToast('복사할 오브젝트를 찾을 수 없습니다.');
      return;
    }

    this.clipboard = selectedKeys.map(key => {
      const obj = this.objects.objects.get(key);
      const [col, row] = parseCellKey(key);
      return {
        id: obj.id,
        detail: obj.detail,
        src: obj.img.src,
        alt: obj.img.alt,
        offset: {
          col: col - anchor.col,
          row: row - anchor.row
        }
      };
    });

    startPastePreviewHelper(this.clipboard, this.pasteState);
    showToast('복사됨. 붙여넣을 위치로 이동 후 클릭하세요.');
  }

  deleteSelection() {
    const selectedKeys = [...this.selectionState.keys].filter(key => this.objects.objects.has(key));
    if (!selectedKeys.length) {
      showToast('삭제할 오브젝트가 없습니다.');
      return;
    }

    selectedKeys.forEach(key => this.objects.remove(key));
    this.clearSelection();
    showToast(`${selectedKeys.length}개 삭제됨`);
  }

  startPastePreview() {
    startPastePreviewHelper(this.clipboard, this.pasteState);
  }

  clearPastePreview() {
    clearPastePreviewHelper(this.pasteState);
  }

  updatePastePreview(targetKey) {
    updatePastePreviewHelper(targetKey, this.pasteState, this.grid);
  }

  async commitPaste() {
    await commitPasteHelper(this.pasteState, this.grid, this.objects, showToast);
  }

  getMoveItems() {
    return getMoveItems(this.selectionState, this.objects, this.grid);
  }

  canMoveSelectionTo(baseCol, baseRow) {
    return canMoveSelectionTo(baseCol, baseRow, this.selectionState, this.grid, this.objects);
  }

  async moveSelectionTo(baseCol, baseRow) {
    const newKeys = await moveSelectionToHelper(baseCol, baseRow, this.selectionState, this.objects, this.grid, showToast);
    if (newKeys) {
      this.updateSelectionKeys(newKeys);
    }
    return newKeys;
  }

  clearMovePreview() {
    clearMovePreviewHelper(this.grid, this.moveState);
  }

  highlightMovePreview(baseCol, baseRow) {
    highlightMovePreviewHelper(baseCol, baseRow, this.grid, this.objects, this.selectionState, this.moveState);
  }
}
