import { test } from 'vitest';

import type { ChartSeries } from '../chart';
import { BarChart, type BarChartProps } from './bar-chart';

type Energy = { week: string; solar: number };
type Growth = { week: string; signups: number };

const energy: Energy[] = [{ week: 'W1', solar: 18 }];
const sources: ChartSeries<Energy>[] = [{ key: 'solar', label: 'Solar', color: 5, value: row => row.solar }];
const growth: ChartSeries<Growth>[] = [{ key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups }];

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

test('selection props exist only while the chart is interactive', () => {
  void (
    <BarChart
      aria-label='Energy'
      data={energy}
      index={row => row.week}
      series={sources}
      onActivate={active => active.datum.solar}
    />
  );
  void (
    (
      // @ts-expect-error A chart that takes no selection cannot be activated.
      <BarChart
        aria-label='Energy'
        data={energy}
        index={row => row.week}
        series={sources}
        interactive={false}
        onActivate={() => {}}
      />
    )
  );
});

test('series read rows of the chart type, and the chart needs a name', () => {
  const mismatched: BarChartProps<Energy> = {
    'aria-label': 'Energy',
    data: energy,
    index: row => row.week,
    // @ts-expect-error A series reads rows of the chart's own type.
    series: growth,
  };
  void mismatched;
  void (
    (
      // @ts-expect-error The chart needs a name for assistive technology.
      <BarChart
        data={energy}
        index={row => row.week}
        series={sources}
      />
    )
  );
});
