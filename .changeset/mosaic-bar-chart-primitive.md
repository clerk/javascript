---
'@clerk/mosaic': minor
---

Add headless `Chart` and `BarChart` primitives for stacked bar charts with values above and below zero. `BarChart.useBarChart` lays out the bars and owns pointer and keyboard selection, `BarChart.StackedBars` paints them on Canvas, and the `Chart` parts add the grid, axes, cursor and tooltip. The parts ship no styles: style `BarChart.Bar` and each `Chart` part with `className` and `data-*` attributes.

```tsx
import { BarChart } from '@clerk/mosaic/primitives/bar-chart';
import { Chart } from '@clerk/mosaic/primitives/chart';

const chart = BarChart.useBarChart({ data, series, index });

<Chart.Root chart={chart} aria-label='Weekly sign-ups'>
  <BarChart.StackedBars>
    <BarChart.Bar className='bar' />
  </BarChart.StackedBars>
  <Chart.XAxis>{ticks => ticks.map(tick => <Chart.XTick key={tick.key} tick={tick} />)}</Chart.XAxis>
</Chart.Root>;
```

`d3-scale` and `d3-shape` are new dependencies, loaded only by `@clerk/mosaic/primitives/bar-chart`.
