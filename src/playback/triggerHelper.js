import { KEYS } from '../constants/keys.js';

/**
 * @param {PlaybackManager} playbackManager
 * @param {number} col
 * @param {Object} objectManager
 * @param {*} time
 */
export function triggerColHelper(playbackManager, col, objectManager, time) {
  objectManager.objects.forEach((obj, cellKey) => {
    if (parseInt(cellKey.split('-')[0]) !== col) return;

    const sampler = playbackManager._samplers.get(cellKey);
    if (sampler?.loaded) {
      const rowIndex = parseInt(cellKey.split('-')[1]);
      const note = KEYS[rowIndex].note;
      const dur = obj.detail.duration ?? 1;
      sampler.triggerAttackRelease(note, dur, time);
    }

    obj.img.classList.remove('triggered');
    void obj.img.offsetWidth;
    obj.img.classList.add('triggered');
    setTimeout(() => obj.img.classList.remove('triggered'), 300);
  });
}
