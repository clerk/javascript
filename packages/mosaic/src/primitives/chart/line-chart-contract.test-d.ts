import { describe, expectTypeOf, test } from 'vitest';

import type { BarChartInstance } from '../bar-chart';
import type { SelectionModel } from './internal/selection';
import type { useChartInstance } from './internal/use-chart-instance';
import type { ChartRootProps, ChartTooltipProps } from './parts';
import type { ChartActive, ChartCategory, ChartInstance, ChartSelection } from './types';

// A line chart sketched in types only, to prove the shared contract fits a second chart type before
// `line-chart/` exists. Its categories are points, and it selects a category and nothing else.

type Row = Readonly<{ date: string; users: number }>;

declare const LINE_LAYOUT: unique symbol;

type LineChartInstance = ChartInstance<ChartActive<Row>, ChartSelection> &
  Readonly<{ [LINE_LAYOUT]: Readonly<{ lines: readonly Readonly<{ key: string; d: string }>[] }> }>;

const point = { key: '2026-01-05', datumIndex: 0, center: 120, x: 120, width: 0 } satisfies ChartCategory;

const lineModel = {
  hitTest: category => ({ category: category.key }),
  land: category => ({ category: category.key }),
  resolve: (selection, category) => ({
    category: selection.category,
    datumIndex: category.datumIndex,
    datum: { date: category.key, users: 0 },
  }),
  describe: () => 'users',
  verticalInstructions: '',
  anchorY: () => 0,
  surfaceAttributes: () => ({}),
} satisfies SelectionModel<ChartSelection, ChartActive<Row>>;

describe('a line chart on the shared contract', () => {
  test('a point is a category with no width', () => {
    expectTypeOf(point).toExtend<ChartCategory>();
  });

  test('a selection model with no Up and Down rules satisfies the engine', () => {
    expectTypeOf(lineModel).toExtend<SelectionModel<ChartSelection, ChartActive<Row>>>();
  });

  test('the engine builds a line instance from it', () => {
    expectTypeOf<ReturnType<typeof useChartInstance<ChartSelection, ChartActive<Row>, ChartCategory>>>().toEqualTypeOf<
      ChartInstance<ChartActive<Row>, ChartSelection>
    >();
  });

  test('Chart.Root takes a line chart and a bar chart without a cast', () => {
    expectTypeOf<LineChartInstance>().toExtend<ChartRootProps['chart']>();
    expectTypeOf<BarChartInstance<Row>>().toExtend<ChartRootProps['chart']>();
  });

  test('the chart a shared part holds cannot select', () => {
    expectTypeOf<ChartRootProps['chart']['select']>().parameter(0).toBeNever();
  });

  test('a line tooltip reads its rows', () => {
    expectTypeOf<ChartTooltipProps<ChartActive<Row>>['children']>().parameter(0).toEqualTypeOf<ChartActive<Row>>();
  });
});
