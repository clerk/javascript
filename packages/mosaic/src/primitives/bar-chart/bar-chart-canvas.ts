import { getComputedStyle } from '../utils/dom';
import { type BarGeometry, type PaintedProjection, UNSTYLED_BAR_GEOMETRY } from './bar-chart-layout';
import type { BarIdentity, BarMark, ChartSize } from './types';

const TILE_DEVICE_PIXELS = 32;

export class CanvasRenderError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'CanvasRenderError';
  }
}

type BarCanvasContext = Pick<
  CanvasRenderingContext2D,
  'save' | 'restore' | 'beginPath' | 'rect' | 'roundRect' | 'clip' | 'fill' | 'fillStyle'
>;

export function getPaintedBarMark(
  mark: Pick<BarMark<unknown>, 'y' | 'height' | 'width' | 'radii' | 'paintInsetTop' | 'paintInsetBottom'>,
) {
  const requestedInset = mark.paintInsetTop + mark.paintInsetBottom;
  const scale = requestedInset > 0 ? Math.min(1, Math.max(0, mark.height - 1) / requestedInset) : 1;
  const top = mark.paintInsetTop * scale;
  const bottom = mark.paintInsetBottom * scale;
  const height = Math.max(0, mark.height - top - bottom);
  const limit = (radius: number) => Math.min(radius, mark.width / 2, height / 2);
  const radii: BarMark<unknown>['radii'] = [
    limit(mark.radii[0]),
    limit(mark.radii[1]),
    limit(mark.radii[2]),
    limit(mark.radii[3]),
  ];
  return { y: mark.y + top, height, radii };
}

type BarBatch<TDatum> = {
  context: BarCanvasContext;
  tileWidth: number;
  height: number;
  tiles: Map<number, BarMark<TDatum>[]>;
  hasOpenPath: boolean;
};

function fillTiles<TDatum>(batch: BarBatch<TDatum>) {
  const { context, tileWidth, height } = batch;
  for (const [tile, tileMarks] of batch.tiles) {
    context.save();
    context.beginPath();
    context.rect(tile * tileWidth, 0, tileWidth, height);
    context.clip();
    context.beginPath();
    for (const mark of tileMarks) {
      const painted = getPaintedBarMark(mark);
      context.rect(mark.x, painted.y, mark.width, painted.height);
    }
    context.fill();
    context.restore();
  }
  batch.tiles.clear();
}

function flush<TDatum>(batch: BarBatch<TDatum>) {
  if (batch.hasOpenPath) {
    batch.context.fill();
    batch.hasOpenPath = false;
  }
  fillTiles(batch);
}

function addThinBar<TDatum>(batch: BarBatch<TDatum>, mark: BarMark<TDatum>) {
  if (batch.hasOpenPath) {
    flush(batch);
  }
  // Disjoint device-pixel clips bound software raster work without widening bars or blending a
  // shared fractional pixel twice at a batch boundary.
  const { tileWidth, tiles } = batch;
  for (let tile = Math.floor(mark.x / tileWidth); tile < Math.ceil((mark.x + mark.width) / tileWidth); tile++) {
    const tileMarks = tiles.get(tile);
    if (tileMarks) {
      tileMarks.push(mark);
    } else {
      tiles.set(tile, [mark]);
    }
  }
}

function addRoundedBar<TDatum>(batch: BarBatch<TDatum>, mark: BarMark<TDatum>) {
  if (batch.tiles.size > 0) {
    flush(batch);
  }
  if (!batch.hasOpenPath) {
    batch.context.beginPath();
    batch.hasOpenPath = true;
  }
  const painted = getPaintedBarMark(mark);
  batch.context.roundRect(mark.x, painted.y, mark.width, painted.height, painted.radii);
}

export function drawCanvasBars<TDatum>({
  context,
  marks,
  pixelRatio,
  height,
  getFill,
}: Readonly<{
  context: BarCanvasContext;
  marks: readonly BarMark<TDatum>[];
  pixelRatio: number;
  height: number;
  getFill: (mark: BarMark<TDatum>) => string;
}>) {
  const batch: BarBatch<TDatum> = {
    context,
    tileWidth: TILE_DEVICE_PIXELS / pixelRatio,
    height,
    tiles: new Map(),
    hasOpenPath: false,
  };
  let activeFill: string | undefined;
  for (const mark of marks) {
    const fill = getFill(mark);
    if (fill !== activeFill) {
      flush(batch);
      activeFill = fill;
      context.fillStyle = fill;
    }
    if (mark.width < 2) {
      addThinBar(batch, mark);
    } else {
      addRoundedBar(batch, mark);
    }
  }
  flush(batch);
}

const BAR_STATE_ATTRIBUTES = ['data-series', 'data-inactive', 'data-projection'] as const;

export type BarStyleElement = HTMLElement | SVGElement;

function readPixels(value: string, fallback: number) {
  const pixels = Number.parseFloat(value);
  return value.trim().endsWith('px') && Number.isFinite(pixels) ? pixels : fallback;
}

/**
 * Serializes the bar geometry from `BarChart.Bar`'s computed style, so it can be a
 * `useSyncExternalStore` snapshot.
 */
export function getBarGeometrySnapshot(element: BarStyleElement | null) {
  if (!element) {
    return '';
  }
  const style = getComputedStyle(element);
  return JSON.stringify([
    readPixels(style.maxWidth, UNSTYLED_BAR_GEOMETRY.maxWidth),
    readPixels(style.rowGap, UNSTYLED_BAR_GEOMETRY.gap),
    readPixels(style.borderTopLeftRadius, UNSTYLED_BAR_GEOMETRY.outerRadius),
    readPixels(style.borderBottomLeftRadius, UNSTYLED_BAR_GEOMETRY.radius),
  ]);
}

export function parseBarGeometry(snapshot: string): BarGeometry {
  if (!snapshot) {
    return UNSTYLED_BAR_GEOMETRY;
  }
  const parsed: unknown = JSON.parse(snapshot);
  if (!Array.isArray(parsed)) {
    return UNSTYLED_BAR_GEOMETRY;
  }
  const [maxWidth, gap, outerRadius, radius] = parsed.map(value => (typeof value === 'number' ? value : null));
  return {
    // JSON turns an unstyled `Infinity` into null.
    maxWidth: maxWidth ?? Infinity,
    gap: gap ?? 0,
    outerRadius: outerRadius ?? 0,
    radius: radius ?? 0,
  };
}

type BarState = Readonly<{
  seriesKey?: string;
  inactive?: boolean;
  projection?: boolean;
}>;

function createBarColorResolver(element: BarStyleElement) {
  const previousAttributes = BAR_STATE_ATTRIBUTES.map(name => [name, element.getAttribute(name)] as const);
  const cache = new Map<string, string>();

  const resolve = ({ seriesKey, inactive, projection }: BarState) => {
    const key = JSON.stringify([seriesKey, inactive, projection]);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    if (seriesKey) {
      element.setAttribute('data-series', seriesKey);
    } else {
      element.removeAttribute('data-series');
    }
    element.toggleAttribute('data-inactive', Boolean(inactive));
    element.toggleAttribute('data-projection', Boolean(projection));
    const resolved = getComputedStyle(element).color;
    cache.set(key, resolved);
    return resolved;
  };

  const restore = () => {
    for (const [name, value] of previousAttributes) {
      if (value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    }
  };

  return { resolve, restore };
}

type PaintOptions<TDatum> = Readonly<{
  canvas: HTMLCanvasElement;
  marks: readonly BarMark<TDatum>[];
  projection: PaintedProjection | null;
  size: ChartSize;
  pixelRatio: number;
  isBarActive?: (bar: BarIdentity<TDatum>) => boolean;
  /** The `BarChart.Bar` element. Without it, nothing is painted. */
  bar: BarStyleElement | null;
}>;

export function paintStackedBarCanvas<TDatum>({
  canvas,
  marks,
  projection,
  size,
  pixelRatio,
  isBarActive,
  bar,
}: PaintOptions<TDatum>) {
  try {
    const context = canvas.getContext('2d');
    if (!context || context.isContextLost?.()) {
      throw new CanvasRenderError('Canvas 2D context is unavailable', null);
    }

    const pixelWidth = Math.round(size.width * pixelRatio);
    const pixelHeight = Math.round(size.height * pixelRatio);
    if (canvas.width !== pixelWidth) {
      canvas.width = pixelWidth;
    }
    if (canvas.height !== pixelHeight) {
      canvas.height = pixelHeight;
    }
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, size.width, size.height);

    if (!bar) {
      return;
    }

    const barColor = createBarColorResolver(bar);
    try {
      if (projection) {
        context.fillStyle = barColor.resolve({ projection: true });
        context.beginPath();
        context.roundRect(projection.x, projection.y, projection.width, projection.height, [
          projection.radius,
          projection.radius,
          0,
          0,
        ]);
        context.fill();
      }
      drawCanvasBars({
        context,
        marks,
        pixelRatio,
        height: size.height,
        getFill: mark => barColor.resolve({ seriesKey: mark.seriesKey, inactive: isBarActive?.(mark) === false }),
      });
    } finally {
      barColor.restore();
    }
  } catch (cause) {
    if (cause instanceof CanvasRenderError) {
      throw cause;
    }
    throw new CanvasRenderError('Canvas 2D rendering failed', cause);
  }
}
