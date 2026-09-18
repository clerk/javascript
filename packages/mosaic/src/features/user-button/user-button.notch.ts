// The notch a nested mark sits in, cut out of the lead avatar so a gap of background shows between
// the two. Drawn in spacing units so it scales with the avatar, and wide enough to take the focus
// ring with it. The notch is the mark's own rounded square, a gap larger on every side, and where it
// meets the lead's edge the cusp is rounded off by a fillet, so the lead's outline never comes to a
// point. Notch and fillets are one outline: holes that share an edge leave a seam.
const GAP = 0.25;
const OVERHANG = 0.5;
const MARK_RADIUS = 1;
const FILLET = 0.5;
const RING_REACH = 1;
const OVERSHOOT = 0.15;

interface Point {
  x: number;
  y: number;
}

interface Circle extends Point {
  r: number;
}

type Place = (p: Point) => Point;

const num = (n: number): string => String(Math.round(n * 1000) / 1000);

const swap = (p: Point): Point => ({ x: p.y, y: p.x });

function along(from: Point, to: Point, distance: number): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return { x: from.x + ((to.x - from.x) * distance) / length, y: from.y + ((to.y - from.y) * distance) / length };
}

function intersections(a: Circle, b: Circle): [Point, Point] {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const reach = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a.r * a.r - reach * reach));
  const ux = (b.x - a.x) / d;
  const uy = (b.y - a.y) / d;
  const base = { x: a.x + ux * reach, y: a.y + uy * reach };
  return [
    { x: base.x - uy * h, y: base.y + ux * h },
    { x: base.x + uy * h, y: base.y - ux * h },
  ];
}

function rightmostAt(circle: Circle, y: number): Point {
  return { x: circle.x + Math.sqrt(Math.max(0, circle.r * circle.r - (y - circle.y) * (y - circle.y))), y };
}

function draw(place: Place) {
  const at = (p: Point): string => {
    const placed = place(p);
    return `${num(placed.x)} ${num(placed.y)}`;
  };
  return {
    moveTo: (p: Point): string => `M${at(p)}`,
    lineTo: (p: Point): string => `L${at(p)}`,
    arcTo: (circle: Circle, from: Point, to: Point): string => {
      const c = place(circle);
      const a = place(from);
      const b = place(to);
      const cross = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
      return `A${num(circle.r)} ${num(circle.r)} 0 0 ${cross > 0 ? 1 : 0} ${at(to)}`;
    },
  };
}

interface Cusp {
  round: Circle;
  onNotch: Point;
  onArc: boolean;
  onLead: Point;
  onLeadOut: Point;
  cuspOut: Point;
  cuspOutOnArc: boolean;
}

function topRightCusp(lead: Circle, corner: Circle, top: number): Cusp {
  const outward = { ...lead, r: lead.r + OVERSHOOT };
  const [nearer, farther] = intersections(lead, corner);
  const point = nearer.y < farther.y ? nearer : farther;
  const centers = intersections({ ...lead, r: lead.r - FILLET }, { ...corner, r: corner.r + FILLET });
  const onArcCenter =
    Math.hypot(centers[0].x - point.x, centers[0].y - point.y) <=
    Math.hypot(centers[1].x - point.x, centers[1].y - point.y)
      ? centers[0]
      : centers[1];
  const onArc = along(corner, onArcCenter, corner.r).x >= corner.x;
  const center = onArc ? onArcCenter : rightmostAt({ ...lead, r: lead.r - FILLET }, top - FILLET);
  const cuspOutOnLine = rightmostAt(outward, top);
  const cuspOutOnArc = cuspOutOnLine.x >= corner.x;
  const [outNearer, outFarther] = intersections(outward, corner);
  return {
    round: { ...center, r: FILLET },
    onNotch: onArc ? along(corner, center, corner.r) : { x: center.x, y: top },
    onArc,
    onLead: along(lead, center, lead.r),
    onLeadOut: along(lead, center, lead.r + OVERSHOOT),
    cuspOut: cuspOutOnArc ? (outNearer.y < outFarther.y ? outNearer : outFarther) : cuspOutOnLine,
    cuspOutOnArc,
  };
}

function mirror(cusp: Cusp): Cusp {
  return {
    ...cusp,
    round: { ...swap(cusp.round), r: cusp.round.r },
    onNotch: swap(cusp.onNotch),
    onLead: swap(cusp.onLead),
    onLeadOut: swap(cusp.onLeadOut),
    cuspOut: swap(cusp.cuspOut),
  };
}

function notchPath(leadSize: number, mark: number, place: Place): string {
  const lead: Circle = { x: leadSize / 2, y: leadSize / 2, r: leadSize / 2 };
  const outward: Circle = { ...lead, r: lead.r + OVERSHOOT };
  const size = mark + 2 * GAP;
  const r = MARK_RADIUS + GAP;
  const left = leadSize - mark + OVERHANG - GAP;
  const top = left;
  const right = left + size;
  const bottom = top + size;
  const topLeft: Circle = { x: left + r, y: top + r, r };
  const topRight: Circle = { x: right - r, y: top + r, r };
  const bottomLeft: Circle = { x: left + r, y: bottom - r, r };
  const bottomRight: Circle = { x: right - r, y: bottom - r, r };
  const a = topRightCusp(lead, topRight, top);
  const b = mirror(a);
  const { moveTo, lineTo, arcTo } = draw(place);

  return [
    moveTo(a.onNotch),
    a.onArc ? arcTo(topRight, a.onNotch, { x: topRight.x, y: top }) : '',
    lineTo({ x: topLeft.x, y: top }),
    arcTo(topLeft, { x: topLeft.x, y: top }, { x: left, y: topLeft.y }),
    b.onArc
      ? lineTo({ x: left, y: bottomLeft.y }) + arcTo(bottomLeft, { x: left, y: bottomLeft.y }, b.onNotch)
      : lineTo(b.onNotch),
    arcTo(b.round, b.onNotch, b.onLead),
    lineTo(b.onLeadOut),
    arcTo(outward, b.onLeadOut, b.cuspOut),
    b.cuspOutOnArc
      ? arcTo(bottomLeft, b.cuspOut, { x: bottomLeft.x, y: bottom })
      : lineTo({ x: bottomLeft.x, y: bottom }),
    lineTo({ x: bottomRight.x, y: bottom }),
    arcTo(bottomRight, { x: bottomRight.x, y: bottom }, { x: right, y: bottomRight.y }),
    lineTo({ x: right, y: topRight.y }),
    a.cuspOutOnArc
      ? arcTo(topRight, { x: right, y: topRight.y }, a.cuspOut)
      : arcTo(topRight, { x: right, y: topRight.y }, { x: topRight.x, y: top }) + lineTo(a.cuspOut),
    arcTo(outward, a.cuspOut, a.onLeadOut),
    lineTo(a.onLead),
    arcTo(a.round, a.onLead, a.onNotch),
    'z',
  ].join('');
}

export function notchMask(leadSize: number, mark: number, end: 'right' | 'left'): string {
  const place: Place = end === 'right' ? p => p : p => ({ x: leadSize - p.x, y: p.y });
  const reach = leadSize + 2 * RING_REACH;
  const outer = `M${num(-RING_REACH)} ${num(-RING_REACH)}h${num(reach)}v${num(reach)}h${num(-reach)}z`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${num(-RING_REACH)} ${num(-RING_REACH)} ${num(reach)} ${num(reach)}'><path fill-rule='evenodd' d='${outer}${notchPath(leadSize, mark, place)}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
