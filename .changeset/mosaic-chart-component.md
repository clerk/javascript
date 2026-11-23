---
'@clerk/mosaic': minor
---

Add a styled `Chart` at `@clerk/mosaic/components/chart`: the headless `Chart` parts with Mosaic styles applied, plus `Chart.Legend` and `Chart.TooltipContent`. `Chart.useBarChart` takes rows, a category key and series that each name a color. Each part renders a sensible default with no children: a dotted grid, formatted ticks, the bars, a hover band behind them and a tooltip with one row per series. The chart handles values above and below zero, a projected total, dimming through `highlight`, an empty state and a retry when the Canvas fails to paint.

```tsx
import { Chart, type ChartSeries } from '@clerk/mosaic/components/chart';

const series: ChartSeries<Row>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

const chart = Chart.useBarChart({ data: rows, index: row => row.week, series });

<Chart.Root chart={chart} aria-label='Weekly growth'>
  <Chart.Legend />
  <Chart.Grid />
  <Chart.StackedBars />
  <Chart.YAxis />
  <Chart.XAxis ticks='calendar' />
  <Chart.Selection />
</Chart.Root>;
```

Each series names its color: a palette slot from `1` to `6` or a CSS color. Children customize a part, such as a render function on `Chart.Tooltip`. `Chart.Legend items={series}` renders a legend outside the chart.

The palette ships as six new tokens, `--cl-color-chart-1` to `--cl-color-chart-6`, with separate light and dark values that meet the data-viz contrast and color-blind separation checks.
