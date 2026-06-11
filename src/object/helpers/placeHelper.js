/**
 * 특정 격자 셀에 악기(오브젝트)를 배치하는 헬퍼 함수입니다.
 * 
 * [실행 흐름]
 * 1. 중복 배치 검사 (이미 차지된 셀인 경우 즉시 중단)
 * 2. 외부 JSON 파일에서 악기 상세 데이터 비동기 로드
 * 3. 드래그앤드롭이 가능한 악기 이미지(DOM) 요소 생성 및 이벤트 등록
 * 4. 생성된 이미지를 화면(DOM)에 배치하고 매니저 상태 데이터 업데이트
 * 5. 오디오 재생 시스템(Playback)에 소리 등록 및 타임라인 범위 갱신
 * 
 * @async
 * @param {Object} manager - ObjectManager 인스턴스 (grid, objects, playback 참조)
 * @param {string} id - 악기 고유 ID
 * @param {string} cellKey - 격자 셀 좌표 키 ("col-row" 형식)
 * @returns {Promise<void>}
 */
import { positionObjectAt } from './objectDomHelper.js';

export async function placeHelper(manager, id, cellKey) {
    if (manager.grid.isOccupied(cellKey)) return;

    const detail = await fetch(`/src/data/instruments/${id}.json`)
        .then(r => r.json())
        .catch(e => { console.error(e); return null; });
    if (!detail) return;

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

    positionObjectAt(img, cellKey);
    manager.grid.world.appendChild(img);
    img.classList.add('bounce-in');
    img.addEventListener('animationend', () => {
      img.classList.remove('bounce-in');
    }, { once: true });

    manager.grid.setOccupied(cellKey, true);
    manager.objects.set(cellKey, { id, img, detail });

    manager.playback.register(cellKey, detail);
    manager.refreshDurationLines?.();
    manager.playback.updateRange(manager);
}