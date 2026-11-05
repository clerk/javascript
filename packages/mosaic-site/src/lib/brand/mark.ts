export const MARK_VIEWBOX = '-2 -2 54 44';

const RADIUS = 0.8;

type Point = [number, number];

const roundedPath = (points: Point[]) => {
  const count = points.length;
  const segments = points.map((point, index) => {
    const prev = points[(index + count - 1) % count];
    const next = points[(index + 1) % count];
    const toward = (target: Point): Point => {
      const dx = target[0] - point[0];
      const dy = target[1] - point[1];
      const length = Math.hypot(dx, dy);
      return [point[0] + (dx / length) * RADIUS, point[1] + (dy / length) * RADIUS];
    };
    const start = toward(prev);
    const end = toward(next);
    return `${index === 0 ? 'M' : 'L'}${start[0]} ${start[1]}Q${point[0]} ${point[1]} ${end[0]} ${end[1]}`;
  });
  return `${segments.join('')}Z`;
};

const leg = (x: number): Point[] => [
  [x, 20],
  [x + 10, 20],
  [x + 10, 40],
  [x, 40],
];

export const MARK_PIECES = [
  [
    [0, 0],
    [20, 0],
    [20, 20],
    [10, 20],
    [10, 10],
    [0, 10],
  ] as Point[],
  [
    [30, 0],
    [50, 0],
    [50, 10],
    [40, 10],
    [40, 20],
    [30, 20],
  ] as Point[],
  leg(0),
  leg(20),
  leg(40),
].map(roundedPath);
export const MARK_FILLETS: string[] = [];
export const MARK_PATHS = [...MARK_PIECES, ...MARK_FILLETS];
