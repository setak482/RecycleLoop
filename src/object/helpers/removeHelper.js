export function removeHelper(manager, cellKey){
    const obj = manager.objects.get(cellKey);
    if (!obj) return;

    obj.img.remove();
    manager.grid.setOccupied(cellKey, false);
    manager.deleteObject(cellKey);

    manager.notifyChanged();
}