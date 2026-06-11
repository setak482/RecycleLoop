import { CELL_W, CELL_H } from '../../constants/config.js';

// 셀 div가 사라졌으므로 오브젝트 img는 월드 좌표에 직접 배치합니다.
// (.placed-object의 translate(-50%, -50%)와 짝을 이뤄 셀 중앙 정렬)
export function positionObjectAt(img, cellKey) {
  const [col, row] = cellKey.split('-').map(Number);
  img.style.left = `${col * CELL_W + CELL_W / 2}px`;
  img.style.top  = `${row * CELL_H + CELL_H / 2}px`;
}
