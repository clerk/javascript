---
'@clerk/mosaic': minor
---

Add a headless `Chart` primitive for stacked bar charts with values above and below zero. `Chart.useBarChart` lays out the bars and owns pointer and keyboard selection, `Chart.Bars` paints them on Canvas, and the shared `Chart` parts add the grid, axes, cursor and tooltip. The parts ship no styles: style `Chart.Bar` and each other part with `className` and `data-*` attributes.

```tsx
import { Chart } from '@clerk/mosaic/primitives/chart';

const chart = Chart.useBarChart({ data, series, index });

<Chart.Root chart={chart} aria-label='Weekly sign-ups'>
  <Chart.Bars>
    <Chart.Bar className='bar' />
  </Chart.Bars>
  <Chart.XAxis>{ticks => ticks.map(tick => <Chart.XTick key={tick.key} tick={tick} />)}</Chart.XAxis>
</Chart.Root>;
```

`d3-scale` and `d3-shape` are new dependencies of `@clerk/mosaic/primitives/chart`.
