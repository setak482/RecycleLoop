import { triggerColHelper } from './triggerHelper.js';
import { calcRangeHelper } from './rangeHelper.js';

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {Promise<void>}
 */
export async function startHelper(playbackManager, objectManager) {
  if (!playbackManager._Tone) {
    playbackManager._Tone = await import('tone');
  }

  const Tone = playbackManager._Tone;
  await Tone.start();
  Tone.getTransport().bpm.value = playbackManager.bpm;

  if (!calcRangeHelper(playbackManager, objectManager)) {
    console.warn('배치된 오브젝트 없음');
    return;
  }

  objectManager.objects.forEach((obj, cellKey) => {
    if (!obj.detail || !obj.detail.sample || !obj.detail.sample.notes) return;
    if (!playbackManager._samplers.has(cellKey)) {
      const sampler = new Tone.Sampler({
        urls: obj.detail.sample.notes,
      }).toDestination();
      playbackManager._samplers.set(cellKey, sampler);
    }
  });

  playbackManager._currentCol = playbackManager._startCol;
  playbackManager._lastObjectManager = objectManager;

  playbackManager._loop = new Tone.Sequence((time) => {
    triggerColHelper(playbackManager, playbackManager._currentCol, objectManager, time);
    playbackManager._movePlayhead(playbackManager._currentCol);
    playbackManager._currentCol = playbackManager._currentCol >= playbackManager._endCol
      ? playbackManager._startCol
      : playbackManager._currentCol + 1;
  }, [0], playbackManager.subdivision);

  playbackManager._loop.start(0);
  Tone.getTransport().start();
}

/**
 * @param {PlaybackManager} playbackManager
 * @returns {void}
 */
export function stopHelper(playbackManager) {
  if (!playbackManager._Tone) return;
  playbackManager._loop?.stop().dispose();
  playbackManager._loop = null;
  playbackManager._Tone.getTransport().stop();
  playbackManager._Tone.getTransport().position = 0;
  playbackManager._movePlayhead(playbackManager._startCol);
}
