import { getComputedStyle } from '../../utils/dom';
import type { ChartSize } from '../types';
import { CanvasRenderError } from './bar-canvas-error';
import { type BarGeometry, type PaintedProjection, UNSTYLED_BAR_GEOMETRY } from './bar-layout';
import type { BarIdentity, BarMark } from './types';

const TILE_DEVICE_PIXELS = 32;

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
 * Serializes the bar geometry from `Chart.Bar`'s computed style, so it can be a
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

export type BarState = Readonly<{
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

/** The colors these states compute to, serialized so a theme change can be told from an unrelated one. */
export function getBarPaletteSnapshot(element: BarStyleElement | null, states: readonly BarState[]) {
  if (!element) {
    return '';
  }
  const barColor = createBarColorResolver(element);
  try {
    return JSON.stringify(states.map(barColor.resolve));
  } finally {
    barColor.restore();
  }
}

/** How `Chart.ProjectionOutline` strokes, read from its computed style. Without a stroke color, nothing is drawn. */
type ProjectionOutlineStyle = Readonly<{ color: string; width: number; dash: number[] }>;

function readProjectionOutlineStyle(element: BarStyleElement | null): ProjectionOutlineStyle | null {
  if (!element) {
    return null;
  }
  const style = getComputedStyle(element);
  const width = readPixels(style.strokeWidth, 1);
  if (!style.stroke || style.stroke === 'none' || style.stroke.startsWith('url(') || width <= 0) {
    return null;
  }
  const dash =
    style.strokeDasharray === 'none'
      ? []
      : style.strokeDasharray
          .split(/[\s,]+/)
          .map(value => Number.parseFloat(value))
          .filter(Number.isFinite);
  return { color: style.stroke, width, dash };
}

/** The outline stroke serialized, so a change to it can be a `useSyncExternalStore` snapshot. */
export function getProjectionOutlineSnapshot(element: BarStyleElement | null) {
  return JSON.stringify(readProjectionOutlineStyle(element));
}

/** The gap between the fill and the inside of the outline stroke. */
const PROJECTION_OUTLINE_GAP = 1;

/**
 * Traces the fill at a constant offset, with concentric top corners and open, square ends on zero.
 * The gap and a stroke at least one device pixel wide round to whole device pixels, so both sides
 * match and the stroke stays crisp at any pixel ratio.
 */
function strokeProjectionOutline(
  context: CanvasRenderingContext2D,
  projection: PaintedProjection,
  outline: ProjectionOutlineStyle,
  pixelRatio: number,
) {
  const gap = Math.max(1, Math.round(PROJECTION_OUTLINE_GAP * pixelRatio)) / pixelRatio;
  const deviceWidth = outline.width * pixelRatio;
  const width = (deviceWidth < 1 ? deviceWidth : Math.round(deviceWidth)) / pixelRatio;
  const offset = gap + width / 2;
  const left = projection.x - offset;
  const right = projection.x + projection.width + offset;
  const top = projection.y - offset;
  const bottom = projection.y + projection.height;
  const radius = projection.radius > 0 ? projection.radius + offset : 0;
  context.strokeStyle = outline.color;
  context.lineWidth = width;
  context.setLineDash(outline.dash);
  context.beginPath();
  context.moveTo(left, bottom);
  context.arcTo(left, top, right, top, radius);
  context.arcTo(right, top, right, bottom, radius);
  context.lineTo(right, bottom);
  context.stroke();
  context.setLineDash([]);
}

type PaintOptions<TDatum> = Readonly<{
  canvas: HTMLCanvasElement;
  marks: readonly BarMark<TDatum>[];
  projection: PaintedProjection | null;
  size: ChartSize;
  pixelRatio: number;
  isBarActive?: (bar: BarIdentity<TDatum>) => boolean;
  /** The `Chart.Bar` element. Without it, nothing is painted. */
  bar: BarStyleElement | null;
  /** The `Chart.ProjectionOutline` element, whose stroke outlines the projection. */
  projectionOutline: BarStyleElement | null;
}>;

export function paintStackedBarCanvas<TDatum>({
  canvas,
  marks,
  projection,
  size,
  pixelRatio,
  isBarActive,
  bar,
  projectionOutline,
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
        const outline = readProjectionOutlineStyle(projectionOutline);
        if (outline) {
          strokeProjectionOutline(context, projection, outline, pixelRatio);
        }
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
