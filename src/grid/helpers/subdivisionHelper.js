const SUBDIVISION_INTERVALS = {
  '4n': 4,
  '8n': 8,
  '16n': 16,
  '32n': 32,
};

export function getMeasureInterval(subdivision) {
  return SUBDIVISION_INTERVALS[subdivision] ?? SUBDIVISION_INTERVALS['16n'];
}

export function isMeasureBoundary(col, interval) {
  return (col + 1) % interval === 0;
}

// 마디선은 renderHelper가 subdivision을 보고 직접 그리므로 값만 갱신
export function applySubdivisionMarkers(manager, subdivision) {
  manager.subdivision = subdivision;
  manager.requestRender();
}
