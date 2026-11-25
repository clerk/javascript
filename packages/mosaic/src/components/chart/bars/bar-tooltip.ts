import type { ActiveBar, BarIdentity, BarSection } from '../../../primitives/chart';
import type { ChartSeries } from '../chart-series';
import type { ChartTooltipData } from '../internal/chart-style';
import type { SeriesBridge } from '../internal/series-bridge';
import type { ChartFormat } from '../internal/use-chart-format';

/** The bars that keep full strength. A bar is active when it matches every field given. */
export type BarChartHighlight = Readonly<{
  /** A category key, as `index` returns it. */
  category?: string;
  section?: BarSection;
  /** A series key. */
  series?: string;
}>;

/**
 * The primitive's `isBarActive` for a highlight, or undefined when nothing is dimmed. Takes the
 * highlight's fields, not the object, so an inline highlight does not repaint.
 */
export function barActivity<TDatum>(
  bridge: SeriesBridge<TDatum>,
  index: (datum: TDatum, index: number) => string,
  { category, section, series }: BarChartHighlight,
): ((bar: BarIdentity<TDatum>) => boolean) | undefined {
  if (category === undefined && section === undefined && series === undefined) {
    return undefined;
  }
  return bar =>
    (category === undefined || index(bar.datum, bar.datumIndex) === category) &&
    (section === undefined || bar.positive === (section === 'positive')) &&
    (series === undefined || bridge.seriesAt(bar.seriesKey).key === series);
}

/** A projected total for one row, drawn when it rises above that row's positive stack. */
export interface BarChartProjection {
  datumIndex: number;
  value: number;
  /** Names the projection in the legend and tooltip. Without it neither mentions the projection. */
  label?: string;
  /** Shown in a tooltip on the legend entry. */
  description?: string;
}

/** Returns null when the period has no rows and no projection, which hides the tooltip. */
export function barTooltip<TDatum>({
  active,
  series,
  projection,
  format,
}: Readonly<{
  active: ActiveBar<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  projection: BarChartProjection | undefined;
  format: ChartFormat;
}>): ChartTooltipData<ActiveBar<TDatum>> | null {
  const positive = active.section === 'positive';
  const inSection = series.flatMap(entry => {
    const value = entry.value(active.datum);
    if (typeof value !== 'number' || !Number.isFinite(value) || value === 0 || value > 0 !== positive) {
      return [];
    }
    return [{ key: entry.key, label: entry.label, color: entry.color, value: format.value(value, 'tooltip') }];
  });
  const rows = positive ? inSection.reverse() : inSection;
  const metrics =
    projection?.label !== undefined && active.projected
      ? [{ label: projection.label, value: format.value(projection.value, 'tooltip') }]
      : [];
  if (rows.length === 0 && metrics.length === 0) {
    return null;
  }
  return { active, heading: format.category(active.category, 'tooltip'), metrics, rows };
}

/** Thinner gaps as rows grow, so dense ranges keep visible bars. */
export function categoryGapFor(rowCount: number): number {
  if (rowCount > 180) {
    return 0.08;
  }
  return rowCount > 90 ? 0.14 : 0.28;
}
