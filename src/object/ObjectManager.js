// src/managers/ObjectManager.js

export class ObjectManager {
  constructor(gridManager, playbackManager) {
    this.grid     = gridManager;
    this.playback = playbackManager;
    this.objects  = new Map();
  }

  init() {
    this.grid.cells.forEach((cell, key) => {
      const el = cell.el;

      el.addEventListener('dragover', e => {
        e.preventDefault();
        e.currentTarget.classList.add('highlight');
      });

      el.addEventListener('dragleave', e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          e.currentTarget.classList.remove('highlight');
        }
      });

      el.addEventListener('drop', e => {
        e.preventDefault();
        e.currentTarget.classList.remove('highlight');

        const fromCell     = e.dataTransfer.getData('fromCell');
        const instrumentId = e.dataTransfer.getData('instrumentId');

        if (fromCell) {
          this._move(fromCell, key);
        } else {
          this.place(instrumentId, key);
        }
      });

      el.addEventListener('click', () => {
        if (this.objects.has(key)) this.remove(key);
      });
    });
  }

  async place(id, cellKey) {
    if (this.grid.isOccupied(cellKey)) return;

    const detail = await fetch(`/src/data/instruments/${id}.json`)
      .then(r => r.json())
      .catch(e => { console.error(e); return null; });
    if (!detail) return;

    const img = document.createElement('img');
    img.src = detail.img;
    img.alt = detail.name;
    img.classList.add('placed-object');
    img.draggable = true;

    img.addEventListener('dragstart', e => {
      e.stopPropagation();
      e.dataTransfer.setData('fromCell', cellKey);
      e.dataTransfer.setData('instrumentId', id);
      img.classList.add('dragging');
    });

    img.addEventListener('dragend', () => {
      img.classList.remove('dragging');
    });

    this.grid.getCell(cellKey).el.appendChild(img);
    this.grid.setOccupied(cellKey, true);
    this.objects.set(cellKey, { id, img, detail });

    this.playback.register(cellKey, detail);
    this.playback.updateRange(this);
  }

  remove(cellKey) {
    const obj = this.objects.get(cellKey);
    if (!obj) return;

    obj.img.remove();
    this.grid.setOccupied(cellKey, false);
    this.objects.delete(cellKey);

    this.playback.unregister(cellKey);
    this.playback.updateRange(this);
  }

  _move(fromKey, toKey) {
    if (fromKey === toKey) return;
    if (this.grid.isOccupied(toKey)) return;

    const obj = this.objects.get(fromKey);
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
    this.grid.getCell(toKey).el.appendChild(newImg);

    this.grid.setOccupied(fromKey, false);
    this.objects.delete(fromKey);
    this.grid.setOccupied(toKey, true);
    this.objects.set(toKey, { ...obj, img: newImg });

    this.playback.unregister(fromKey);
    this.playback.register(toKey, obj.detail);
    this.playback.updateRange(this);
  }


  getAll() {
    return [...this.objects.entries()];
  }
}
