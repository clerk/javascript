import type { XTick } from '../types';
import { parseCalendarDates, selectCalendarTicks } from './calendar-ticks';

type XCategory = Readonly<{ key: string; center: number }>;

const EDGE_INSET = 4;
const TARGET_SPACING = 56;
const MIN_LABEL_GAP = 8;

type Plot = Readonly<{ x: number; width: number }>;

type SelectXTicksOptions = Readonly<{
  categories: readonly XCategory[];
  plot: Plot;
  viewportWidth: number;
  xAxis?: 'calendar';
  formatXTick: (value: string) => string | null;
  measure?: (label: string) => number;
}>;

const toCategoryTick = ({ key, label, x, textAnchor }: Omit<XTick, 'category'>): XTick => ({
  key,
  category: key,
  label,
  x,
  textAnchor,
});

/** Approximates a 12px label without touching the DOM. */
export const estimateLabelWidth = (label: string) => label.length * 8;

function evenlySpacedIndexes(count: number, plotWidth: number) {
  if (count <= 0) {
    return [];
  }
  if (count === 1) {
    return [0];
  }
  const visibleCount = Math.min(count, Math.max(2, Math.floor(plotWidth / TARGET_SPACING)));
  const stride = Math.ceil((count - 1) / (visibleCount - 1));
  const indexes = new Set<number>();
  for (let index = 0; index < count; index += stride) {
    indexes.add(index);
  }
  indexes.add(count - 1);
  return Array.from(indexes);
}

function clampToPlot(center: number, width: number, plot: Plot): Pick<XTick, 'x' | 'textAnchor'> {
  const leftEdge = plot.x + EDGE_INSET;
  const rightEdge = plot.x + plot.width - EDGE_INSET;
  if (center - width / 2 < leftEdge) {
    return { x: leftEdge, textAnchor: 'start' };
  }
  if (center + width / 2 > rightEdge) {
    return { x: rightEdge, textAnchor: 'end' };
  }
  return { x: center, textAnchor: 'middle' };
}

function selectCategoryTicks({
  categories,
  plot,
  formatXTick,
  measure,
}: SelectXTicksOptions & { measure: (label: string) => number }): XTick[] {
  const hasDistinctEdges = categories.length > 1;
  const candidates = evenlySpacedIndexes(categories.length, plot.width).flatMap(datumIndex => {
    const category = categories[datumIndex];
    if (!category) {
      return [];
    }
    const label = formatXTick(category.key);
    if (label === null) {
      return [];
    }
    const isFirst = hasDistinctEdges && datumIndex === 0;
    const isLast = hasDistinctEdges && datumIndex === categories.length - 1;
    const placement: Pick<XTick, 'x' | 'textAnchor'> = isFirst
      ? { x: plot.x + EDGE_INSET, textAnchor: 'start' }
      : isLast
        ? { x: plot.x + plot.width - EDGE_INSET, textAnchor: 'end' }
        : { x: category.center, textAnchor: 'middle' };
    const width = measure(label);
    const left =
      placement.x - (placement.textAnchor === 'end' ? width : placement.textAnchor === 'middle' ? width / 2 : 0);
    return [{ key: category.key, label, ...placement, left, right: left + width }];
  });

  const first = candidates[0];
  if (!first) {
    return [];
  }
  const last = candidates.at(-1);
  if (!last || last === first || last.left - first.right < MIN_LABEL_GAP) {
    return [first].map(toCategoryTick);
  }
  const visible = [first];
  let right = first.right;
  for (const tick of candidates.slice(1, -1)) {
    if (tick.left - right >= MIN_LABEL_GAP && last.left - tick.right >= MIN_LABEL_GAP) {
      visible.push(tick);
      right = tick.right;
    }
  }
  return [...visible, last].map(toCategoryTick);
}

export function selectXTicks(options: SelectXTicksOptions): XTick[] {
  const measure = options.measure ?? estimateLabelWidth;
  const timestamps =
    options.xAxis === 'calendar' ? parseCalendarDates(options.categories.map(category => category.key)) : null;
  const calendarTicks = timestamps
    ? selectCalendarTicks({
        timestamps,
        centers: options.categories.map(category => category.center),
        plot: options.plot,
        viewportWidth: options.viewportWidth,
        measure,
      })
    : [];
  if (calendarTicks.length === 0) {
    return selectCategoryTicks({ ...options, measure });
  }
  return calendarTicks.map(tick => ({
    key: `${tick.label}:${tick.coordinate}`,
    category: null,
    label: tick.label,
    ...clampToPlot(tick.coordinate, measure(tick.label), options.plot),
  }));
}
