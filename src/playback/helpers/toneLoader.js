/**
 * Tone.js를 동적 로드하고 공통 컨텍스트 설정을 적용합니다.
 *
 * lookAhead: 음을 이 시간만큼 미리 오디오 스레드에 예약해 둡니다.
 * Tone의 스케줄링 콜백은 메인 스레드에서 돌기 때문에, 렌더링(스타일
 * 재계산·페인트)이 메인 스레드를 점유하면 예약이 밀려 박자가 절뚝입니다.
 * 예약 구간을 넉넉히 잡으면 그 길이만큼의 메인 스레드 정체를 흡수합니다.
 * (화면을 껐을 때만 재생이 매끄럽다면 이 값이 부족하다는 신호입니다.)
 *
 * 트레이드오프: 미리듣기 등 즉발음의 체감 지연이 이 값만큼 늘어납니다.
 */
const LOOK_AHEAD = 0.2; // seconds (Tone 기본값 0.1)

export async function loadTone(playbackManager) {
  if (!playbackManager._Tone) {
    const Tone = await import('tone');
    Tone.getContext().lookAhead = LOOK_AHEAD;
    // Tone 로드 전에 조절해 둔 마스터 볼륨을 반영합니다.
    Tone.Destination.volume.value = playbackManager.masterVolume;
    playbackManager._Tone = Tone;
  }
  return playbackManager._Tone;
}
