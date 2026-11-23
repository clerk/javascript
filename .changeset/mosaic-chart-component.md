---
'@clerk/mosaic': minor
---

Add a styled `BarChart` component and the shared `Chart` parts it draws with. `BarChart` renders a stacked bar chart from rows, a category key and a list of series, with a legend, a dotted grid, both axes, a hover band and a tooltip. It handles values above and below zero, a projected total, dimming through `highlight`, an empty state and a retry when the Canvas fails to paint.

```tsx
import { BarChart } from '@clerk/mosaic/components/bar-chart';
import type { ChartSeries } from '@clerk/mosaic/components/chart';

const series: ChartSeries<Row>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

<BarChart
  aria-label='Weekly growth'
  data={rows}
  index={row => row.week}
  series={series}
/>;
```

Each series names its color: a palette slot from `1` to `6` or a CSS color. `Chart.Legend` and `Chart.TooltipContent` from `@clerk/mosaic/components/chart` take the same series data, so a legend can sit outside the chart and a tooltip can add rows.

The palette ships as six new tokens, `--cl-color-chart-1` to `--cl-color-chart-6`, with separate light and dark values that meet the data-viz contrast and color-blind separation checks.
