export const range = (start: number, stop: number, step = 1): any =>
  Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x: number, y) => x + y * step);
