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

export function applySubdivisionMarkers(manager, subdivision) {
  const interval = getMeasureInterval(subdivision);
  const prevInterval = manager._markerInterval ?? null;
  const markedCols = manager._markedCols ?? 0; // 마디선 처리가 끝난 열 수
  manager.subdivision = subdivision;
  if (prevInterval === interval && markedCols >= manager.cols) return;

  const setColumn = (col, on) => {
    for (let row = 0; row < manager.rows; row++) {
      // el이 null인 셀(화면 밖)은 가상 윈도가 생성 시 _markerInterval로 복원
      manager.cells.get(`${col}-${row}`)?.el?.classList.toggle('bar-line', on);
    }
  };

  // 마디선은 컬럼 단위로만 달라지므로 전체 셀을 순회하지 않습니다.
  if (prevInterval !== null && prevInterval !== interval) {
    // 간격 변경: 이전 간격에서 빠지는 컬럼만 해제 후 새 간격으로 마킹
    for (let col = prevInterval - 1; col < markedCols; col += prevInterval) {
      if (!isMeasureBoundary(col, interval)) setColumn(col, false);
    }
    for (let col = interval - 1; col < manager.cols; col += interval) {
      setColumn(col, true);
    }
  } else {
    // 첫 호출 또는 그리드 확장: 아직 처리되지 않은 열만 마킹
    const firstCol = Math.floor(markedCols / interval) * interval + interval - 1;
    for (let col = firstCol; col < manager.cols; col += interval) {
      setColumn(col, true);
    }
  }

  manager._markerInterval = interval;
  manager._markedCols = manager.cols;
}
