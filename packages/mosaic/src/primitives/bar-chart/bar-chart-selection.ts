import type { StackedBarLayout } from './bar-chart-layout';
import type { SelectionModel } from './chart-selection';
import type { ActiveBar, BarCategory, BarSection, BarSelection } from './types';

/** Selects a section of a stacked bar: above the zero line or below it. */
export function barSelectionModel<TDatum>(
  layout: Pick<StackedBarLayout<TDatum>, 'plot' | 'zeroY'>,
  data: readonly TDatum[],
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
    describe: selection => `${selection.section} values`,
    verticalInstructions: 'Use Up and Down to choose positive or negative values.',
    anchorY: () => layout.plot.y,
    surfaceAttributes: selection => ({ 'data-active-section': selection?.section }),
  };
}
