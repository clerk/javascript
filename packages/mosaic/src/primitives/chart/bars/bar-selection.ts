import type { SelectionModel } from '../internal/selection';
import type { ChartMessages } from '../types';
import type { StackedBarLayout } from './bar-layout';
import type { ActiveBar, BarCategory, BarChartMessages, BarSection, BarSelection } from './types';

export const DEFAULT_BAR_MESSAGES = {
  vertical: 'Use Up and Down to choose positive or negative values.',
  positiveValues: 'positive values',
  negativeValues: 'negative values',
} as const satisfies Omit<BarChartMessages, keyof ChartMessages>;

/** Selects a section of a stacked bar: above the zero line or below it. */
export function barSelectionModel<TDatum>(
  layout: Pick<StackedBarLayout<TDatum>, 'plot' | 'zeroY'>,
  data: readonly TDatum[],
  messages: Pick<BarChartMessages, 'vertical' | 'positiveValues' | 'negativeValues'> = DEFAULT_BAR_MESSAGES,
): SelectionModel<BarSelection, ActiveBar<TDatum>, BarCategory> {
  return {
    hitTest: (category, y, current) => {
      const { positive, negative } = category.sections;
      if (!positive && !negative) {
        return null;
      }
      const nearZero = Math.abs(y - layout.zeroY) <= Math.max(4, Math.round(layout.plot.height * 0.015));
      const section: BarSection = !negative
        ? 'positive'
        : !positive
          ? 'negative'
          : nearZero
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
    describe: selection => (selection.section === 'positive' ? messages.positiveValues : messages.negativeValues),
    verticalInstructions: messages.vertical,
    anchorY: () => layout.plot.y,
    surfaceAttributes: selection => ({ 'data-active-section': selection?.section }),
  };
}
