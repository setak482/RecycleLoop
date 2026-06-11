import { CELL_W } from '../../constants/config.js';

/**
 * @param {PlaybackManager} playbackManager
 * @param {Object} gridManager
 */
export function initHelper(playbackManager, gridManager) {
  playbackManager._world = gridManager.world;
  playbackManager._initPlayhead();
}

/**
 * @param {PlaybackManager} playbackManager
 */
export function initPlayheadHelper(playbackManager) {
  const playhead = document.createElement('div');
  playhead.id = 'playhead';
  playbackManager._world.appendChild(playhead);
  playbackManager._playhead = playhead;
}

/**
 * @param {PlaybackManager} playbackManager
 * @param {number} col
 */
export function movePlayheadHelper(playbackManager, col) {
  if (!playbackManager._playhead) return;
  // Tone.Draw가 이미 rAF 타이밍에 호출하므로 추가 rAF 없이 바로 씁니다.
  // 레이어 승격은 CSS의 will-change가 담당하므로 translate3d 같은
  // 강제 힌트는 불필요합니다.
  playbackManager._playhead.style.transform = `translate(${col * CELL_W}px, 0)`;
}
