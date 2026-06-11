export const PROJECT_FORMAT = 'recycloop-project';
export const PROJECT_VERSION = 1;

const VALID_SUBDIVISIONS = ['4n', '8n', '16n', '32n'];
const CELL_KEY_PATTERN = /^\d+-\d+$/;

/**
 * 현재 작업 상태를 저장 파일 형식의 객체로 직렬화합니다.
 *
 * 저장 형식 (recycloop-project v1):
 * {
 *   "format": "recycloop-project",
 *   "version": 1,
 *   "savedAt": "ISO 8601 날짜",
 *   "settings": { "bpm": 120, "subdivision": "16n", "volume": 0 },
 *   "objects": [ { "cell": "12-39", "id": "blow_bottle" }, ... ]
 * }
 *
 * @param {PlaybackManager} playback
 * @param {ObjectManager} objects
 * @returns {Object}
 */
export function serializeProject(playback, objects) {
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    settings: {
      bpm: playback.bpm,
      subdivision: playback.subdivision,
      volume: playback.masterVolume,
    },
    objects: objects.getAll().map(([cell, obj]) => ({ cell, id: obj.id })),
  };
}

/**
 * 저장 파일 텍스트를 검증하고 적용 가능한 형태로 파싱합니다.
 * 형식이 맞지 않으면 사용자에게 보여줄 메시지를 담은 Error를 던집니다.
 *
 * @param {string} text - 파일 내용(JSON 문자열)
 * @returns {{ bpm: number|null, subdivision: string|null, volume: number|null, objects: Array<{cell: string, id: string}> }}
 */
export function parseProject(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON 파일을 읽을 수 없습니다.');
  }

  if (data?.format !== PROJECT_FORMAT) {
    throw new Error('RecycLoop 저장 파일이 아닙니다.');
  }
  if (typeof data.version !== 'number' || data.version > PROJECT_VERSION) {
    throw new Error('지원하지 않는 저장 파일 버전입니다.');
  }

  const settings = data.settings ?? {};
  const rawObjects = Array.isArray(data.objects) ? data.objects : [];

  return {
    bpm: clampNumber(settings.bpm, 30, 200),
    subdivision: VALID_SUBDIVISIONS.includes(settings.subdivision) ? settings.subdivision : null,
    volume: clampNumber(settings.volume, -80, 12),
    objects: rawObjects.filter(o =>
      typeof o?.cell === 'string' &&
      CELL_KEY_PATTERN.test(o.cell) &&
      typeof o.id === 'string'
    ).map(o => ({ cell: o.cell, id: o.id })),
  };
}

export function makeProjectFileName(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `recycloop-${stamp}.json`;
}

function clampNumber(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, value));
}
