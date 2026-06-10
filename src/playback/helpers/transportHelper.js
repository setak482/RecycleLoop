import { triggerColHelper } from './triggerHelper.js';
import { calcRangeHelper } from './rangeHelper.js';
import { getMeasureInterval } from '../../grid/helpers/subdivisionHelper.js';

function getStopBoundaryCol(currentCol, interval) {
  const remainder = (currentCol + 1) % interval;
  return remainder === 0 ? currentCol : currentCol + (interval - remainder);
}

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
  playbackManager._stopPending = false;
  playbackManager._stopCol = null;

  playbackManager._loop = new Tone.Sequence((time) => {
    triggerColHelper(playbackManager, playbackManager._currentCol, objectManager, time);
    // playbackManager._movePlayhead(playbackManager._currentCol);
    Tone.Draw.schedule(() => {
      playbackManager._movePlayhead(playbackManager._currentCol);
    }, time);

    if (playbackManager._stopPending && playbackManager._currentCol === playbackManager._stopCol) {
      playbackManager._stopPending = false;
      playbackManager._stopCol = null;
      stopHelper(playbackManager);
      return;
    }

    playbackManager._currentCol = playbackManager._currentCol >= playbackManager._endCol
      ? playbackManager._startCol
      : playbackManager._currentCol + 1;
  }, [0], playbackManager.subdivision);

  playbackManager._loop.start(0);
  Tone.getTransport().start();
  playbackManager.onPlaybackStateChange?.('started');
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {{ alignToBoundary?: boolean }} [options]
 * @returns {void}
 */
export function stopHelper(playbackManager, { alignToBoundary = false } = {}) {
  if (!playbackManager._Tone) return;

  const transport = playbackManager._Tone.getTransport();
  if (transport.state !== 'started') return;

  // if (alignToBoundary) {
  //   playbackManager._stopPending = true;
  //   playbackManager._stopCol = getStopBoundaryCol(
  //     playbackManager._currentCol,
  //     getMeasureInterval(playbackManager.subdivision)
  //   );
  //   return;
  // }

  playbackManager._stopPending = false;
  playbackManager._stopCol = null;
  playbackManager._loop?.stop().dispose();
  playbackManager._loop = null;
  transport.stop();
  transport.position = 0;
  playbackManager._movePlayhead(playbackManager._startCol);
  playbackManager.onPlaybackStateChange?.('stopped');
}
