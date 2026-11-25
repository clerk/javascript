import { nearestCategory, type SelectionModel } from '../internal/selection';
import type { ChartMessages } from '../types';
import type { StackedBarLayout } from './bar-layout';
import type {
  ActiveBar,
  BarCategory,
  BarChartMessages,
  BarProjection,
  BarSection,
  BarSelection,
  BarSeries,
} from './types';

export const DEFAULT_BAR_MESSAGES = {
  vertical: 'Use Up and Down to choose positive or negative values.',
  positiveValues: 'positive values',
  negativeValues: 'negative values',
  projected: 'Projected',
} as const satisfies Omit<BarChartMessages, keyof ChartMessages>;

type BarSelectionOptions<TDatum> = Readonly<{
  layout: Pick<StackedBarLayout<TDatum>, 'plot' | 'zeroY' | 'categories' | 'prepared' | 'scaleY' | 'projection'>;
  data: readonly TDatum[];
  series: readonly BarSeries<TDatum>[];
  projection: BarProjection | undefined;
  formatValue: (value: number) => string;
  messages: Pick<BarChartMessages, 'vertical' | 'positiveValues' | 'negativeValues' | 'projected'>;
}>;

/**
 * Selects a section of a stacked bar: above the zero line or below it. A pointer selects the nearest
 * column anywhere in the plot, the same area the hover band shows, and the section on its side of
 * the zero line.
 */
export function barSelectionModel<TDatum>({
  layout,
  data,
  series,
  projection,
  formatValue,
  messages,
}: BarSelectionOptions<TDatum>): SelectionModel<BarSelection, ActiveBar<TDatum>, BarCategory> {
  const labels = new Map(series.map(item => [item.key, item.label ?? item.key]));
  const twoSided = layout.categories.some(category => category.hasValues.negative);
  const nearZero = Math.max(4, Math.round(layout.plot.height * 0.015));

  return {
    hitTest: ({ x, y }, current) => {
      const category = layout.categories[nearestCategory(layout.categories, x)];
      if (!category) {
        return null;
      }
      const { positive, negative } = category.sections;
      if (!positive && !negative) {
        return null;
      }
      const section: BarSection = !negative
        ? 'positive'
        : !positive
          ? 'negative'
          : Math.abs(y - layout.zeroY) <= nearZero
            ? (current?.section ?? 'positive')
            : y < layout.zeroY
              ? 'positive'
              : 'negative';
      return { category: category.key, section };
    },
    land: (category, move, current) => {
      const wanted = move === 'up' ? 'positive' : move === 'down' ? 'negative' : current?.section;
      const section =
        wanted && category.sections[wanted]
          ? wanted
          : category.sections.positive
            ? 'positive'
            : category.sections.negative
              ? 'negative'
              : null;
      return section ? { category: category.key, section } : null;
    },
    resolve: (selection, category) => {
      const datum = data[category.datumIndex];
      if (!category.sections[selection.section] || datum === undefined) {
        return null;
      }
      return {
        category: category.key,
        section: selection.section,
        datumIndex: category.datumIndex,
        datum,
        hasValues: category.hasValues,
        projected: category.projected,
      };
    },
    describe: active => {
      const positive = active.section === 'positive';
      const values = layout.prepared.points
        .filter(point => point.datumIndex === active.datumIndex && point.positive === positive)
        .map(point => `${labels.get(point.seriesKey) ?? point.seriesKey} ${formatValue(point.value)}`);
      if (positive && active.projected && projection) {
        values.push(`${projection.label ?? messages.projected} ${formatValue(projection.value)}`);
      }
      const section = twoSided ? (positive ? messages.positiveValues : messages.negativeValues) : '';
      return [section, ...values].filter(Boolean).join(', ');
    },
    verticalInstructions: twoSided ? messages.vertical : '',
    anchor: (_, category) => ({ x: category.center, y: layout.plot.y }),
    surfaceAttributes: selection => ({ 'data-active-section': selection?.section }),
  };
}
