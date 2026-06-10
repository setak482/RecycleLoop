/**
 * @param {PlaybackManager} playbackManager
 * @param {string} cellKey
 * @param {Object} detail
 */
export function registerHelper(playbackManager, cellKey, detail) {
  if (!detail || !detail.sample || !detail.sample.notes || Object.keys(detail.sample.notes).length === 0) {
    return;
  }

  if (!playbackManager._Tone) return;

  const jsonVolume = detail.volume ?? 0;
  const sampler = new playbackManager._Tone.Sampler({
    urls: detail.sample.notes,
    volume: jsonVolume,
  }).toDestination();

  playbackManager._samplers.set(cellKey, sampler);
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {string} cellKey
 */
export function unregisterHelper(playbackManager, cellKey) {
  const sampler = playbackManager._samplers.get(cellKey);
  if (!sampler) return;
  sampler.dispose();
  playbackManager._samplers.delete(cellKey);
}
