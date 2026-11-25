import { describe, expectTypeOf, test } from 'vitest';

import type { BarChartInstance } from '.';
import { nearestCategory, type SelectionModel } from './internal/selection';
import type { useChartInstance } from './internal/use-chart-instance';
import type { ChartRootProps, ChartTooltipProps } from './parts';
import type { CartesianChartInstance, ChartActive, ChartCategory, ChartInstance, ChartSelection } from './types';

// A line chart and a donut sketched in types only, to prove the shared contract fits other chart
// types before their folders exist. A line's categories are points on a value axis; a donut's are
// slices with no value axis. Each selects a category and nothing else.

type Row = Readonly<{ date: string; users: number }>;

declare const LINE_LAYOUT: unique symbol;

type LineChartInstance = CartesianChartInstance<ChartActive<Row>, ChartSelection> &
  Readonly<{ [LINE_LAYOUT]: Readonly<{ lines: readonly Readonly<{ key: string; d: string }>[] }> }>;

type DonutChartInstance = ChartInstance<ChartActive<Row>, ChartSelection>;

const point = { key: '2026-01-05', datumIndex: 0, center: 120, x: 120, width: 0 } satisfies ChartCategory;
const points: ChartCategory[] = [point];

const lineModel = {
  hitTest: ({ x }) => {
    const category = points[nearestCategory(points, x)];
    return category ? { category: category.key } : null;
  },
  land: category => ({ category: category.key }),
  resolve: (selection, category) => ({
    category: selection.category,
    datumIndex: category.datumIndex,
    datum: { date: category.key, users: 0 },
  }),
  describe: active => `Users ${active.datum.users}`,
  verticalInstructions: '',
  anchor: (_, category) => ({ x: category.center, y: 0 }),
  focusRect: (_, category) => ({ x: category.center - 6, y: 0, width: 12, height: 12 }),
  surfaceAttributes: () => ({}),
} satisfies SelectionModel<ChartSelection, ChartActive<Row>>;

describe('other chart types on the shared contract', () => {
  test('a point is a category with no width', () => {
    expectTypeOf(point).toExtend<ChartCategory>();
  });

  test('a selection model with no Up and Down rules satisfies the engine', () => {
    expectTypeOf(lineModel).toExtend<SelectionModel<ChartSelection, ChartActive<Row>>>();
  });

  test('the engine builds an instance without a value axis, which the chart type adds', () => {
    expectTypeOf<ReturnType<typeof useChartInstance<ChartSelection, ChartActive<Row>, ChartCategory>>>().toEqualTypeOf<
      ChartInstance<ChartActive<Row>, ChartSelection>
    >();
    expectTypeOf<ChartInstance>().not.toHaveProperty('scaleY');
    expectTypeOf<BarChartInstance<Row>['scaleY']>().toEqualTypeOf<(value: number) => number>();
  });

  test('Chart.Root takes a line chart, a donut and a bar chart without a cast', () => {
    expectTypeOf<LineChartInstance>().toExtend<ChartRootProps['chart']>();
    expectTypeOf<DonutChartInstance>().toExtend<ChartRootProps['chart']>();
    expectTypeOf<BarChartInstance<Row>>().toExtend<ChartRootProps['chart']>();
  });

  test('the chart a shared part holds cannot select', () => {
    expectTypeOf<ChartRootProps['chart']['select']>().parameter(0).toBeNever();
  });

  test('a line tooltip reads its rows', () => {
    expectTypeOf<ChartTooltipProps<ChartActive<Row>>['children']>().parameter(0).toEqualTypeOf<ChartActive<Row>>();
  });
});
