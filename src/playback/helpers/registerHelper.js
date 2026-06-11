/**
 * 악기별로 Tone.Sampler를 하나만 만들어 공유합니다.
 * 같은 악기를 여러 셀에 배치해도 샘플 다운로드/디코딩과 오디오 노드가
 * 중복 생성되지 않습니다. Sampler는 폴리포닉이므로 동시 발음에도 안전합니다.
 *
 * @param {PlaybackManager} playbackManager
 * @param {Object} detail - 악기 상세 데이터 (id, sample, volume)
 */
export function ensureSamplerHelper(playbackManager, detail) {
  if (!detail?.id || !detail.sample?.notes || Object.keys(detail.sample.notes).length === 0) {
    return;
  }
  if (!playbackManager._Tone) return;
  if (playbackManager._samplers.has(detail.id)) return;

  const sampler = new playbackManager._Tone.Sampler({
    urls: detail.sample.notes,
    volume: detail.volume ?? 0,
  }).toDestination();

  playbackManager._samplers.set(detail.id, sampler);
}
