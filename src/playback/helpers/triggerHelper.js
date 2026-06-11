// 기존 CSS 클래스 방식은 애니메이션 재시작을 위해 강제 리플로우
// (offsetWidth 읽기)와 setTimeout이 매 틱 필요했습니다.
// Web Animations API는 리플로우/타이머 없이 즉시 재시작됩니다.
// 글로우(filter)는 보간하면 매 프레임 페인트가 발생하므로 정적
// 클래스(.triggered)로 켜고 끄며, transform만 애니메이션합니다.
const TRIGGER_KEYFRAMES = [
  { transform: 'translate(-50%, -50%) scale(1)' },
  { transform: 'translate(-50%, -60%) scale(1.2)',  offset: 0.3 },
  { transform: 'translate(-50%, -45%) scale(0.95)', offset: 0.6 },
  { transform: 'translate(-50%, -50%) scale(1)' },
];
const TRIGGER_TIMING = { duration: 300, easing: 'ease' };

function playTriggerAnimation(obj) {
  obj._triggerAnim?.cancel(); // 재트리거 시 이전 애니메이션 정리
  obj.img.classList.add('triggered');
  const anim = obj.img.animate(TRIGGER_KEYFRAMES, TRIGGER_TIMING);
  anim.onfinish = () => obj.img.classList.remove('triggered');
  obj._triggerAnim = anim;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {number} col
 * @param {Object} objectManager
 * @param {*} time
 */
export function triggerColHelper(playbackManager, col, objectManager, time) {
  // 컬럼 인덱스로 해당 열의 오브젝트만 조회합니다 (전체 순회 제거).
  const bucket = objectManager.getByCol(col);
  if (!bucket || bucket.size === 0) return;

  let hasPlayable = false;
  bucket.forEach(obj => {
    if (obj.detail?.marker) return; // 마커는 소리·애니메이션 없음
    hasPlayable = true;
    const sampler = playbackManager._samplers.get(obj.id);
    if (sampler?.loaded && obj.note) {
      const dur = obj.detail.duration ?? 1;
      sampler.triggerAttackRelease(obj.note, dur, time);
    }
  });
  if (!hasPlayable) return;

  // DOM 갱신은 오디오 스케줄링 콜백이 아닌 Draw(rAF) 타이밍에 수행합니다.
  playbackManager._Tone?.Draw.schedule(() => {
    bucket.forEach(obj => {
      if (obj.detail?.marker) return;
      playTriggerAnimation(obj);
    });
  }, time);
}
