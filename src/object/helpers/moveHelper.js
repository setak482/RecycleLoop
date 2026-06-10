export function moveHelper(manager, fromKey, toKey, { preview = false } = {}){
    if (fromKey === toKey) return;

    const toCol = parseInt(toKey.split('-')[0], 10);
    if (Number.isInteger(toCol)) manager.grid.ensureColumnsForPlacement?.(toCol);

    if (manager.grid.isOccupied(toKey)) return;

    const obj = manager.objects.get(fromKey);
    if (!obj) return;

    // 새 img 생성 (핸들러 깔끔하게 새로 붙임)
    const newImg = document.createElement('img');
    newImg.src = obj.img.src;
    newImg.alt = obj.img.alt;
    newImg.classList.add('placed-object');
    newImg.draggable = true;

    newImg.addEventListener('dragstart', e => {
      e.stopPropagation();
      e.dataTransfer.setData('fromCell', toKey);
      e.dataTransfer.setData('instrumentId', obj.id);
      newImg.classList.add('dragging');
    });

    newImg.addEventListener('dragend', () => {
      newImg.classList.remove('dragging');
    });

    obj.img.remove();
    // 화면 밖 셀이면 가상 윈도 생성 시 다시 붙습니다.
    manager.grid.getCell(toKey)?.el?.appendChild(newImg);

    manager.grid.setOccupied(fromKey, false);
    manager.deleteObject(fromKey);
    manager.grid.setOccupied(toKey, true);
    manager.setObject(toKey, { ...obj, img: newImg });

    manager.notifyChanged();

    if (preview) manager.playback.previewNote?.(toKey, obj.detail);
}