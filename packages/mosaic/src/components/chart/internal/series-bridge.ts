import { type ChartSeries, resolveChartColor } from '../chart-series';

/**
 * The positions a chart can paint. StyleX compiles to a static sheet and cannot write a rule per
 * caller key, so a headless primitive sees series keyed by position, and `series.styles.ts` maps
 * each position to its color. Adding a slot here fails the type check there until its rule exists.
 */
export const SERIES_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export type SeriesSlot = (typeof SERIES_SLOTS)[number];

export type SeriesSlotKey = `${SeriesSlot}`;

/** A series as a headless chart-type hook takes it, keyed by position. */
export type PositionedSeries<TDatum> = Readonly<{
  key: SeriesSlotKey;
  value: (datum: TDatum) => number | null | undefined;
}>;

export interface SeriesBridge<TDatum> {
  /** Same order and values as the caller's series, keyed `'0'`, `'1'`, and so on. */
  positioned: readonly PositionedSeries<TDatum>[];
  /** `colors[i]` is the value of `--_cl-chart-series-<i>` on the chart root. */
  colors: readonly string[];
  /** The caller's series for a position key. */
  seriesAt: (positionKey: string) => ChartSeries<TDatum>;
}

/**
 * The boundary check for `series`. Throws on a repeated key and on more series than the chart has
 * slots, naming the fix.
 */
export function bridgeSeries<TDatum>(series: readonly ChartSeries<TDatum>[]): SeriesBridge<TDatum> {
  if (series.length > SERIES_SLOTS.length) {
    throw new Error(
      `A chart paints at most ${SERIES_SLOTS.length} series, and got ${series.length}. Fold the smallest into one "Other" series.`,
    );
  }
  const keys = new Set<string>();
  for (const { key } of series) {
    if (keys.has(key)) {
      throw new Error(`Two chart series share the key "${key}". Give each series a unique key.`);
    }
    keys.add(key);
  }
  const positioned = series.map((entry, position) => ({ key: slotKey(position), value: entry.value }));
  return {
    positioned,
    colors: series.map(entry => resolveChartColor(entry.color)),
    seriesAt: positionKey => {
      const entry = series[Number(positionKey)];
      if (!entry) {
        throw new Error(`No chart series at position "${positionKey}".`);
      }
      return entry;
    },
  };
}

function slotKey(position: number): SeriesSlotKey {
  const slot = SERIES_SLOTS[position];
  if (slot === undefined) {
    throw new Error(`No chart series slot at position ${position}.`);
  }
  return `${slot}`;
}
