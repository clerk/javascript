export type LineOp =
  | { type: 'keep'; from: number; to: number }
  | { type: 'remove'; from: number }
  | { type: 'add'; to: number };

export function diffLines(before: string[], after: string[]): LineOp[] {
  const rows = before.length;
  const cols = after.length;
  const lcs: number[][] = Array.from({ length: rows + 1 }, () => new Array<number>(cols + 1).fill(0));
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      lcs[i][j] = before[i] === after[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: LineOp[] = [];
  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (before[i] === after[j]) {
      ops.push({ type: 'keep', from: i++, to: j++ });
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: 'remove', from: i++ });
    } else {
      ops.push({ type: 'add', to: j++ });
    }
  }
  while (i < rows) {
    ops.push({ type: 'remove', from: i++ });
  }
  while (j < cols) {
    ops.push({ type: 'add', to: j++ });
  }
  return ops;
}
