import { showToast } from '../Toast.js';

/**
 * Ctrl+Z(실행 취소), Ctrl+Y / Ctrl+Shift+Z(다시 실행) 단축키를 등록합니다.
 * undo/redo 직전에 선택·붙여넣기 미리보기를 정리해 배치 상태와 어긋나지 않게 합니다.
 */
export function setupHistoryControls(history, selection) {
  document.addEventListener('keydown', async (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;

    const targetTag = e.target?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

    const isUndo = e.code === 'KeyZ' && !e.shiftKey;
    const isRedo = e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey);
    if (!isUndo && !isRedo) return;

    e.preventDefault();

    if (isUndo) {
      if (!history.canUndo()) {
        showToast('되돌릴 작업이 없습니다.');
        return;
      }
      selection.reset();
      await history.undo();
      showToast('실행 취소');
      return;
    }

    if (!history.canRedo()) {
      showToast('다시 실행할 작업이 없습니다.');
      return;
    }
    selection.reset();
    await history.redo();
    showToast('다시 실행');
  });
}
