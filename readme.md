# ♻️ RecycleLoop (리사이클루프)

**RecycleLoop**는 재활용품(유리병, 캔, 종이박스 등)의 소리를 악기로 활용하여 음악을 만들 수 있는 **웹 기반 단일 채널 루프 시퀀서 및 피아노롤(Piano Roll)** 입니다.

### 🔗 [Live Demo 보러가기](https://recycle-loop-maker.vercel.app)
*(여기에 Vercel 배포 링크를 입력해주세요)*

<br>

## ✨ 주요 기능 (Features)

*   **재활용품 악기 기반 시퀀싱:** 주변에서 흔히 볼 수 있는 재활용품의 고유한 오디오 샘플(`Tone.js` 활용)을 이용한 작곡
*   **직관적인 피아노롤 인터페이스:** 마우스를 이용한 노트 배치/길이 조절 및 자유로운 화면 확대/축소(Zoom) & 이동(Pan) 기능
*   **재생 및 편집 제어:** 마커를 이용한 루프 구간 설정, 트랜스포트(재생/일시정지/정지) 컨트롤
*   **고급 편집 툴:** 영역 선택, 복사/붙여넣기, 작업 내역 기록을 통한 다중 실행 취소/다시 실행(Undo/Redo)
*   **프로젝트 Import/Export (JSON):** 작업 중인 패턴 및 시퀀서 데이터를 JSON 파일로 로컬에 저장하고 언제든 다시 불러올 수 있는 기능

<br>

## 🥁 제공되는 악기 목록 (Instruments)

일상 속 폐기물과 재활용품에서 추출한 독특한 사운드를 제공합니다. (음계가 있는 악기와 타악기 포함)

*   **Blow Bottle (페트병 불기):** 병 입구를 불어 내는 소리
*   **Cling Glass (유리병):** 맑고 경쾌한 유리잔 타격음
*   **Steel Pan (스틸 팬):** 깡통을 재활용한 멜로디 타악기 소리
*   **Hit Tin Can (캔 두드리기):** 금속 캔 타격음
*   **Kick Box (종이 박스):** 묵직한 베이스 드럼(Kick) 느낌의 상자 소리
*   **Opening Can (캔 따기):** 탄산음료 캔을 개봉할 때 나는 경쾌한 소리
*   **Squeeze Bottle (페트병 구기기):** 페트병을 구길 때 나는 질감 있는 소리

<br>

## 🛠 기술 스택 (Tech Stack)

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3
*   **Audio Engine:** Tone.js
*   **Build Tool:** Vite
*   **Deployment:** Vercel
