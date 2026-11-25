import { expectTypeOf, test } from 'vitest';

import { Chart as Primitive } from '../../primitives/chart';
import { type ActiveBar, Chart, type ChartSeries, type ChartTooltipData } from '.';

type Energy = { week: string; solar: number };
type Growth = { week: string; signups: number };

const energy: Energy[] = [{ week: 'W1', solar: 18 }];
const sources: ChartSeries<Energy>[] = [{ key: 'solar', label: 'Solar', color: 5, value: row => row.solar }];
const growth: ChartSeries<Growth>[] = [{ key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups }];
const getWeek = (row: Energy) => row.week;

test('a series names its color: a palette slot or a CSS color', () => {
  const custom: ChartSeries<Energy> = {
    key: 'grid',
    label: 'Grid',
    color: 'var(--overview-grid)',
    value: row => row.solar,
  };
  void custom;
  // @ts-expect-error A color is required. There is no default by position.
  const missing: ChartSeries<Energy> = { key: 'solar', label: 'Solar', value: row => row.solar };
  // @ts-expect-error The palette has six slots.
  const seventh: ChartSeries<Energy> = { key: 'solar', label: 'Solar', color: 7, value: row => row.solar };
  // @ts-expect-error A bare keyword is not a chart color.
  const keyword: ChartSeries<Energy> = { key: 'solar', label: 'Solar', color: 'violet', value: row => row.solar };
  void [missing, seventh, keyword];
});

test('series read rows of the chart type', () => {
  // @ts-expect-error A series reads rows of the chart's own type.
  Chart.useBarChart({ data: energy, index: getWeek, series: growth });
});

test('the root takes a chart from the styled hook and needs a name', () => {
  const chart = Chart.useBarChart({ data: energy, index: getWeek, series: sources, highlight: { series: 'solar' } });
  void (
    <Chart.Root
      chart={chart}
      aria-label='Energy'
    />
  );
  // @ts-expect-error The chart needs a name for assistive technology.
  void (<Chart.Root chart={chart} />);

  const headless = Primitive.useBarChart({
    data: energy,
    index: getWeek,
    series: [{ key: 'solar', value: row => row.solar }],
  });
  void (
    <Chart.Root
      // @ts-expect-error A headless chart has no series colors, legend or tooltip rows.
      chart={headless}
      aria-label='Energy'
    />
  );
});

test('a tooltip render function receives the rows and the typed active bar', () => {
  void (
    <Chart.Tooltip<ActiveBar<Energy>>>
      {tooltip => {
        expectTypeOf(tooltip).toEqualTypeOf<ChartTooltipData<ActiveBar<Energy>>>();
        expectTypeOf(tooltip.active.datum.solar).toEqualTypeOf<number>();
        return (
          <Chart.TooltipContent
            heading={tooltip.heading}
            rows={tooltip.rows}
          />
        );
      }}
    </Chart.Tooltip>
  );
});
