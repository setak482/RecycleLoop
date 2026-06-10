/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {boolean}
 */
export function calcRangeHelper(playbackManager, objectManager) {
  if (objectManager.objects.size === 0) return false;

  const cols = [...objectManager.objects.keys()]
    .map(key => parseInt(key.split('-')[0]));

  playbackManager._startCol = Math.min(...cols);
  playbackManager._endCol = Math.max(...cols);
  return true;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} objectManager
 * @returns {void}
 */
export function updateRangeHelper(playbackManager, objectManager) {
  if (objectManager.objects.size === 0) {
    playbackManager.stop();
    return;
  }

  const cols = [...objectManager.objects.keys()]
    .map(key => parseInt(key.split('-')[0]));

  playbackManager._startCol = Math.min(...cols);
  playbackManager._endCol = Math.max(...cols);

  if (playbackManager._currentCol < playbackManager._startCol) {
    playbackManager._currentCol = playbackManager._startCol;
  }

  if (playbackManager._currentCol > playbackManager._endCol) {
    playbackManager._currentCol = playbackManager._startCol;
  }
}
