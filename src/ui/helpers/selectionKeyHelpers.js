export function parseCellKey(key) {
  return key.split('-').map(Number);
}

export function getSelectionKeys(startKey, endKey) {
  const [startCol, startRow] = parseCellKey(startKey);
  const [endCol, endRow] = parseCellKey(endKey);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const keys = [];

  for (let col = minCol; col <= maxCol; col++) {
    for (let row = minRow; row <= maxRow; row++) {
      keys.push(`${col}-${row}`);
    }
  }
  return keys;
}

export function getSelectionBounds(keys) {
  if (!keys.length) return null;
  const cols = [];
  const rows = [];

  keys.forEach(key => {
    const [col, row] = parseCellKey(key);
    cols.push(col);
    rows.push(row);
  });

  return {
    minCol: Math.min(...cols),
    minRow: Math.min(...rows)
  };
}

export function getSelectionAnchor(keys) {
  if (!keys.length) return null;

  return keys
    .map(key => {
      const [col, row] = parseCellKey(key);
      return { key, col, row };
    })
    .sort((a, b) => a.col - b.col || a.row - b.row)[0];
}
