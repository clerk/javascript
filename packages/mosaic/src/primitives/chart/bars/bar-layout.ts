import { scaleBand, scaleLinear } from 'd3-scale';
import { stack, stackOffsetDiverging } from 'd3-shape';

import type { ChartMargin, ChartSize } from '../types';
import type { BarCategory, BarMark, BarProjection, BarSeries } from './types';

const Y_TICK_COUNT = 5;

type PrepareOptions<TDatum> = Readonly<{
  data: readonly TDatum[];
  series: readonly BarSeries<TDatum>[];
  index: (datum: TDatum, index: number) => string;
}>;

type PreparedPoint<TDatum> = Readonly<{
  seriesKey: string;
  datum: TDatum;
  datumIndex: number;
  value: number;
  start: number;
  end: number;
  positive: boolean;
  hasNeighbour: boolean;
  zeroAdjacent: boolean;
}>;

export type PreparedStackedBars<TDatum> = Readonly<{
  indexes: readonly string[];
  points: readonly PreparedPoint<TDatum>[];
  domain: readonly [number, number];
}>;

type ProjectOptions = Readonly<{
  size: ChartSize;
  margin: ChartMargin;
  categoryGap: number;
  projection?: BarProjection;
}>;

/** Bar geometry read from `Chart.Bar`'s computed style. */
export type BarGeometry = Readonly<{
  maxWidth: number;
  gap: number;
  outerRadius: number;
  radius: number;
}>;

export const UNSTYLED_BAR_GEOMETRY: BarGeometry = {
  maxWidth: Infinity,
  gap: 0,
  outerRadius: 0,
  radius: 0,
};

function readValue<TDatum>(series: BarSeries<TDatum> | undefined, datum: TDatum) {
  const value = series?.value(datum);
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function prepareStackedBars<TDatum>({
  data,
  series,
  index,
}: PrepareOptions<TDatum>): PreparedStackedBars<TDatum> {
  const indexes = data.map(index);
  const seriesByKey = new Map(series.map(item => [item.key, item]));
  const stackGenerator = stack<TDatum>()
    .keys(series.map(item => item.key))
    .value((datum, key) => readValue(seriesByKey.get(key), datum))
    .offset(stackOffsetDiverging);
  const points: PreparedPoint<TDatum>[] = [];
  let domainMin = 0;
  let domainMax = 0;

  for (const layer of stackGenerator(data)) {
    const definition = seriesByKey.get(layer.key);
    if (!definition) {
      continue;
    }
    layer.forEach((point, datumIndex) => {
      // D3 represents each stacked value as a cumulative [start, end] tuple. The diverging offset
      // grows positive tuples above zero and negative tuples below zero.
      domainMin = Math.min(domainMin, point[0], point[1]);
      domainMax = Math.max(domainMax, point[0], point[1]);
      const datum = point.data;
      const value = readValue(definition, datum);
      if (value === 0) {
        return;
      }
      const positive = value > 0;
      points.push({
        seriesKey: layer.key,
        datum,
        datumIndex,
        value,
        start: point[0],
        end: point[1],
        positive,
        hasNeighbour: positive ? point[0] > 0 : point[1] < 0,
        zeroAdjacent: positive ? point[0] === 0 : point[1] === 0,
      });
    });
  }

  return { indexes, points, domain: [domainMin, domainMax] };
}

function createStackedBarScales({
  indexes,
  preparedDomain,
  size,
  margin,
  categoryGap,
  projection,
}: Readonly<{
  indexes: readonly string[];
  preparedDomain: readonly [number, number];
  size: ChartSize;
  margin: ChartMargin;
  categoryGap: number;
  projection?: BarProjection;
}>) {
  const innerWidth = Math.max(0, size.width - margin.left - margin.right);
  const innerHeight = Math.max(0, size.height - margin.top - margin.bottom);
  const x = scaleBand<string>()
    .domain(indexes)
    .range([margin.left, margin.left + innerWidth])
    .paddingInner(Math.min(0.95, Math.max(0, categoryGap)))
    .paddingOuter(Math.min(0.5, Math.max(0, categoryGap / 2)));
  const domain: [number, number] = [
    Math.min(0, preparedDomain[0]),
    Math.max(0, preparedDomain[1], projection?.value ?? 0),
  ];
  if (domain[0] === domain[1]) {
    domain[1] = domain[0] + 1;
  }
  const y = scaleLinear()
    .domain(domain)
    .range([margin.top + innerHeight, margin.top])
    .nice(Y_TICK_COUNT);

  return { x, y, innerWidth, innerHeight };
}

type StackedBarScales = ReturnType<typeof createStackedBarScales>;

type DraftBarMark<TDatum> = Omit<BarMark<TDatum>, 'paintInsetTop' | 'paintInsetBottom'> & {
  paintInsetTop: number;
  paintInsetBottom: number;
};

function splitNeighbourGap<TDatum>(previous: DraftBarMark<TDatum>, mark: DraftBarMark<TDatum>, gap: number) {
  const half = Math.max(0, Math.min(gap, (mark.height - 1) * 2, (previous.height - 1) * 2)) / 2;
  if (mark.positive) {
    previous.paintInsetTop += half;
    mark.paintInsetBottom += half;
  } else {
    previous.paintInsetBottom += half;
    mark.paintInsetTop += half;
  }
}

/** Bars at least this wide snap their sides to whole device pixels; narrower bars would lose too much width. */
const MIN_SNAPPED_WIDTH = 2;

/** Rounds a CSS length to whole device pixels, which are fractional CSS pixels at a ratio such as 1.25. */
export function snapToDevicePixels(value: number, pixelRatio: number) {
  return Math.round(value * pixelRatio) / pixelRatio;
}

/**
 * Centers a bar of at most `maxWidth` in its category band. Snapping keeps the sides of the bars, the
 * projection and its outline on the same whole device pixels, so they paint crisp and line up.
 */
function fitBarToBand(band: Readonly<{ x: number; width: number }>, maxWidth: number, pixelRatio: number) {
  const width = Math.min(band.width, maxWidth);
  const x = band.x + (band.width - width) / 2;
  if (width < MIN_SNAPPED_WIDTH) {
    return { x, width };
  }
  const left = snapToDevicePixels(x, pixelRatio);
  return { x: left, width: snapToDevicePixels(x + width, pixelRatio) - left };
}

function projectMarksAndPaintInsets<TDatum>(
  layout: MarkSource<TDatum>,
  { maxWidth, gap }: BarGeometry,
  pixelRatio: number,
) {
  const { categories, scaleY } = layout;
  const marks: DraftBarMark<TDatum>[] = [];
  const previousMarkByStack = new Map<string, DraftBarMark<TDatum>>();

  // Gap insets affect paint only, so stack endpoints stay on the Y scale. Internal neighbours split
  // the gap; marks beside zero take the full clearance.
  for (const point of layout.prepared.points) {
    const category = categories[point.datumIndex];
    if (category === undefined) {
      continue;
    }
    const rawTop = Math.min(scaleY(point.start), scaleY(point.end));
    const rawBottom = Math.max(scaleY(point.start), scaleY(point.end));
    const height = Math.max(0, rawBottom - rawTop);
    const fitted = fitBarToBand(category, maxWidth, pixelRatio);
    const stackKey = `${point.datumIndex}:${point.positive}`;
    const previousMark = previousMarkByStack.get(stackKey);
    const mark: DraftBarMark<TDatum> = {
      seriesKey: point.seriesKey,
      datum: point.datum,
      datumIndex: point.datumIndex,
      value: point.value,
      x: fitted.x,
      y: rawTop,
      width: fitted.width,
      height,
      radii: [0, 0, 0, 0],
      positive: point.positive,
      paintInsetTop: !point.positive && point.zeroAdjacent ? gap : 0,
      paintInsetBottom: point.positive && point.zeroAdjacent ? gap : 0,
    };
    if (point.hasNeighbour && gap > 0 && previousMark !== undefined) {
      splitNeighbourGap(previousMark, mark, gap);
    }
    previousMarkByStack.set(stackKey, mark);
    marks.push(mark);
  }

  return marks;
}

function applyCornerRadii<TDatum>(marks: readonly BarMark<TDatum>[], { outerRadius, radius }: BarGeometry) {
  const topByDatum = new Map<number, number>();
  const bottomByDatum = new Map<number, number>();
  for (const mark of marks) {
    if (mark.positive) {
      topByDatum.set(mark.datumIndex, Math.min(topByDatum.get(mark.datumIndex) ?? Infinity, mark.y));
    } else {
      bottomByDatum.set(
        mark.datumIndex,
        Math.max(bottomByDatum.get(mark.datumIndex) ?? -Infinity, mark.y + mark.height),
      );
    }
  }

  return marks.map(mark => {
    const isOuter = mark.positive
      ? mark.y === topByDatum.get(mark.datumIndex)
      : mark.y + mark.height === bottomByDatum.get(mark.datumIndex);
    const outer = Math.min(outerRadius, mark.width / 2, mark.height / 2);
    const inner = Math.min(radius, mark.width / 2, mark.height / 2);
    const radii: BarMark<TDatum>['radii'] = !isOuter
      ? [inner, inner, inner, inner]
      : mark.positive
        ? [outer, outer, inner, inner]
        : [inner, inner, outer, outer];
    return { ...mark, radii };
  });
}

function projectOptionalProjection(
  indexes: readonly string[],
  projection: BarProjection | undefined,
  { x, y }: StackedBarScales,
) {
  if (!projection) {
    return null;
  }
  const categoryX = x(indexes[projection.datumIndex] ?? '');
  if (categoryX === undefined) {
    return null;
  }
  const top = y(projection.value);
  return {
    datumIndex: projection.datumIndex,
    x: categoryX,
    y: top,
    width: x.bandwidth(),
    height: Math.max(0, y(0) - top),
  };
}

function acceptProjection(
  projection: BarProjection | undefined,
  { indexes, points }: PreparedStackedBars<unknown>,
): BarProjection | undefined {
  if (
    !projection ||
    !Number.isInteger(projection.datumIndex) ||
    projection.datumIndex < 0 ||
    projection.datumIndex >= indexes.length ||
    !Number.isFinite(projection.value)
  ) {
    return undefined;
  }
  const stackTop = points.reduce(
    (top, point) => (point.positive && point.datumIndex === projection.datumIndex ? Math.max(top, point.end) : top),
    0,
  );
  return projection.value > stackTop ? projection : undefined;
}

function projectCategories(
  { indexes, points }: PreparedStackedBars<unknown>,
  projection: ReturnType<typeof projectOptionalProjection>,
  { x }: StackedBarScales,
): BarCategory[] {
  const positive = new Set<number>();
  const negative = new Set<number>();
  for (const point of points) {
    (point.positive ? positive : negative).add(point.datumIndex);
  }
  const projected = projection && projection.width > 0 && projection.height > 0 ? projection.datumIndex : undefined;
  return indexes.map((key, datumIndex) => {
    const bandX = x(key) ?? 0;
    return {
      key,
      datumIndex,
      x: bandX,
      width: x.bandwidth(),
      center: bandX + x.bandwidth() / 2,
      sections: {
        positive: positive.has(datumIndex) || projected === datumIndex,
        negative: negative.has(datumIndex),
      },
      hasValues: {
        positive: positive.has(datumIndex),
        negative: negative.has(datumIndex),
      },
      projected: projected === datumIndex,
    };
  });
}

/**
 * Projects scales, categories, ticks and the projection bar for a measured frame. Bar marks are
 * projected separately by `projectStackedBarMarks`, because their width, gaps and radii come from
 * CSS and must not move the scales or the category bands that selection uses.
 */
export function projectStackedBars<TDatum>(
  prepared: PreparedStackedBars<TDatum>,
  { size, margin, categoryGap, projection }: ProjectOptions,
) {
  const acceptedProjection = acceptProjection(projection, prepared);
  const scales = createStackedBarScales({
    indexes: prepared.indexes,
    preparedDomain: prepared.domain,
    size,
    margin,
    categoryGap,
    projection: acceptedProjection,
  });
  const { y, innerWidth, innerHeight } = scales;
  const projectedBar = projectOptionalProjection(prepared.indexes, acceptedProjection, scales);

  return {
    prepared,
    scaleY: (value: number) => y(value),
    categories: projectCategories(prepared, projectedBar, scales),
    zeroY: y(0),
    yTicks: y.ticks(Y_TICK_COUNT).map(value => ({ value, y: y(value) })),
    plot: {
      x: margin.left,
      y: margin.top,
      width: innerWidth,
      height: innerHeight,
    },
    projection: projectedBar,
  };
}

export type StackedBarLayout<TDatum> = ReturnType<typeof projectStackedBars<TDatum>>;

type MarkSource<TDatum> = Pick<StackedBarLayout<TDatum>, 'prepared' | 'scaleY'> &
  Readonly<{ categories: readonly BarCategory[] }>;

export function projectStackedBarMarks<TDatum>(
  layout: MarkSource<TDatum>,
  geometry: BarGeometry,
  pixelRatio: number,
): BarMark<TDatum>[] {
  return applyCornerRadii(projectMarksAndPaintInsets(layout, geometry, pixelRatio), geometry);
}

/** The projection fill as the Canvas paints it: `radius` rounds the top corners, and the bottom is square on zero. */
export type PaintedProjection = NonNullable<StackedBarLayout<unknown>['projection']> & Readonly<{ radius: number }>;

export function fitProjectionToBar(
  projection: StackedBarLayout<unknown>['projection'],
  { maxWidth, outerRadius }: BarGeometry,
  pixelRatio: number,
): PaintedProjection | null {
  if (!projection) {
    return null;
  }
  const { x, width } = fitBarToBand(projection, maxWidth, pixelRatio);
  const bottom = projection.y + projection.height;
  const y = Math.min(snapToDevicePixels(projection.y, pixelRatio), bottom);
  const height = bottom - y;
  return {
    ...projection,
    x,
    y,
    width,
    height,
    radius: Math.min(outerRadius, width / 2, height),
  };
}
