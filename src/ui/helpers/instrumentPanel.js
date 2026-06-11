function createInstrumentItem(inst, selectInstrument) {
  const item = document.createElement('div');
  item.classList.add('instrument-item');
  item.dataset.id = inst.id;
  item.dataset.name = inst.name;
  item.innerHTML = `<img src="/img/${inst.id}.png" alt="${inst.name}" /><span>${inst.name}</span>`;

  item.addEventListener('click', () => selectInstrument(inst.id, item));
  return item;
}

/**
 * 악기 패널 렌더링.
 * instruments.json의 categories 선언 순서대로 섹션을 만들고,
 * 선언되지 않은 카테고리는 뒤에 자동 추가되므로
 * 악기를 늘릴 때 JSON만 수정하면 됩니다.
 */
export async function loadInstrumentPanel(selectInstrument) {
  const response = await fetch('/src/data/instruments.json');
  const { instruments, categories = [] } = await response.json();
  const list = document.getElementById('instrument-list');
  list.innerHTML = '';

  // 카테고리 id → 표시 이름 (선언 순서 유지, 미선언 카테고리는 id 그대로)
  const categoryNames = new Map(categories.map(c => [c.id, c.name]));
  instruments.forEach(inst => {
    const cat = inst.category ?? 'etc';
    if (!categoryNames.has(cat)) categoryNames.set(cat, cat);
  });

  const sections = new Map();
  categoryNames.forEach((name, id) => {
    const section = document.createElement('div');
    section.className = 'instrument-section';
    section.innerHTML = `<p class="instrument-category">${name}</p>`;
    sections.set(id, section);
    list.appendChild(section);
  });

  instruments.forEach(inst => {
    const item = createInstrumentItem(inst, selectInstrument);
    sections.get(inst.category ?? 'etc').appendChild(item);
  });

  setupInstrumentSearch(list);
}

// 이름/id로 악기 필터링, 빈 섹션은 헤더까지 숨김
function setupInstrumentSearch(list) {
  const input = document.getElementById('instrument-search');
  const empty = document.getElementById('instrument-empty');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let totalVisible = 0;

    list.querySelectorAll('.instrument-section').forEach(section => {
      let visibleInSection = 0;
      section.querySelectorAll('.instrument-item').forEach(item => {
        const match = !query
          || item.dataset.name.toLowerCase().includes(query)
          || item.dataset.id.toLowerCase().includes(query);
        item.classList.toggle('hidden', !match);
        if (match) visibleInSection += 1;
      });
      section.classList.toggle('hidden', visibleInSection === 0);
      totalVisible += visibleInSection;
    });

    empty?.classList.toggle('show', totalVisible === 0);
  });
}
