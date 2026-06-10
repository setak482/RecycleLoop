export async function loadInstrumentPanel(selectInstrument) {
  const response = await fetch('/src/data/instruments.json');
  const { instruments } = await response.json();
  const list = document.getElementById('instrument-list');
  list.innerHTML = '';

  instruments.forEach(inst => {
    const item = document.createElement('div');
    item.classList.add('instrument-item');
    item.dataset.id = inst.id;
    item.innerHTML = `<img src="/img/${inst.id}.png" alt="${inst.name}" /><span>${inst.name}</span>`;

    item.addEventListener('click', () => selectInstrument(inst.id, item));
    list.appendChild(item);
  });
}
