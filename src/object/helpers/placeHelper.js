// 악기 상세 JSON 캐시 (undo/redo·붙여넣기 시 반복 fetch 방지)
const detailCache = new Map();

function loadDetail(id) {
    if (!detailCache.has(id)) {
        detailCache.set(id, fetch(`/data/instruments/${id}.json`)
            .then(r => r.json())
            .catch(e => { console.error(e); detailCache.delete(id); return null; }));
    }
    return detailCache.get(id);
}

/**
 * 특정 격자 셀에 악기(오브젝트)를 배치하는 헬퍼 함수입니다.
 *
 * [실행 흐름]
 * 1. 중복 배치 검사 (이미 차지된 셀인 경우 즉시 중단)
 * 2. 캐시된 악기 상세 JSON 비동기 로드
 * 3. 드래그앤드롭이 가능한 악기 이미지(DOM) 요소 생성 및 이벤트 등록
 * 4. 생성된 이미지를 화면(DOM)에 배치하고 매니저 상태 데이터 업데이트
 * 5. 오디오 재생 시스템(Playback)에 소리 등록 및 타임라인 범위 갱신
 * 6. preview 옵션이 켜져 있으면 놓인 행의 음높이로 미리듣기 재생
 *
 * @async
 * @param {Object} manager - ObjectManager 인스턴스 (grid, objects, playback 참조)
 * @param {string} id - 악기 고유 ID
 * @param {string} cellKey - 격자 셀 좌표 키 ("col-row" 형식)
 * @param {{ preview?: boolean }} [options] - preview: 배치 직후 위치에 맞는 소리 재생 여부
 * @returns {Promise<void>}
 */
export async function placeHelper(manager, id, cellKey, { preview = false } = {}) {
    // 배치 위치 뒤로 빈 마디를 확보 (그리드 동적 확장)
    const placeCol = parseInt(cellKey.split('-')[0], 10);
    if (Number.isInteger(placeCol)) manager.grid.ensureColumnsForPlacement?.(placeCol);

    if (manager.grid.isOccupied(cellKey)) return;

    const detail = await loadDetail(id);
    if (!detail) return;
    if (manager.grid.isOccupied(cellKey)) return;

    // 마커(중단점·도돌이표)는 종류별로 하나만 — 기존 마커를 제거 후 배치
    if (detail.marker) {
        for (const [key, obj] of manager.objects) {
            if (obj.detail?.marker === detail.marker) {
                manager.remove(key);
                break;
            }
        }
    }

    const img = document.createElement('img');
    img.src = detail.img;
    img.alt = detail.name;
    img.classList.add('placed-object');
    img.draggable = true;

    img.addEventListener('dragstart', e => {
      e.stopPropagation();
      e.dataTransfer.setData('fromCell', cellKey);
      e.dataTransfer.setData('instrumentId', id);
      img.classList.add('dragging');
    });

    img.addEventListener('dragend', () => {
      img.classList.remove('dragging');
    });

    manager.grid.getCell(cellKey).el.appendChild(img);
    // 일괄 작업(불러오기 등) 중에는 수백 개 동시 애니메이션을 피합니다.
    if (!manager.isBulk?.()) {
      img.classList.add('bounce-in');
      img.addEventListener('animationend', () => {
        img.classList.remove('bounce-in');
      }, { once: true });
    }

    manager.grid.setOccupied(cellKey, true);
    manager.setObject(cellKey, { id, img, detail });

    manager.playback.register(detail);
    manager.notifyChanged();

    if (preview) manager.playback.previewNote?.(cellKey, detail);
}