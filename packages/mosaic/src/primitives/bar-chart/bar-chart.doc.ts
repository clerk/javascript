import type { ComponentDoc } from '../../docs-schema';
import type { BarChartBarProps, BarChartProjectionOutlineProps, BarChartStackedBarsProps } from './parts';

export default {
  name: 'BarChart',
  description:
    'Headless, unstyled stacked bar chart with values above and below zero. `BarChart.useBarChart` owns the layout and selection, D3 computes the stacks and scales, and `BarChart.StackedBars` paints the bars on Canvas, styled through the hidden `BarChart.Bar`. The root, grid, axes, selection, cursor and tooltip are the shared `Chart` parts. Up and Down select the positive or negative section of a period.',
  useFor: [
    'a stacked bar chart over a category or time axis',
    'bars with values above and below zero',
    'a chart with thousands of bars that still needs keyboard and pointer selection',
  ],
  keywords: ['bar chart', 'stacked bars', 'chart', 'graph', 'canvas', 'diverging', 'projection', 'useBarChart'],
  practices: [
    {
      do: true,
      text: 'Memoize `series`, `index` and `isBarActive`, or define them at module level. A new `series` or `index` prepares the stacks again on every selection change.',
    },
    { do: true, text: 'Return a unique category key from `index`. Repeated keys share a band.' },
    {
      do: true,
      text: 'Style `BarChart.Bar` with a `color` per `data-series`, and `data-projection` whenever there is a projection. Without it nothing is painted.',
    },
    {
      do: true,
      text: 'Catch `BarChart.CanvasRenderError` in an error boundary and offer a retry that mounts a fresh chart.',
    },
    {
      do: false,
      text: 'Animate the bar color with a CSS transition. `BarChart.Bar` is `display: none`, so the bars repaint at the end value.',
    },
    {
      do: false,
      text: 'Expect a stylesheet change alone to repaint. Change the class of `BarChart.Bar`, or of an ancestor, to repaint.',
    },
  ],
  parts: {
    'BarChart.StackedBars': {
      description:
        'A `div` that paints the bars on a Canvas with `role="img"`, and holds one SVG over it for `BarChart.ProjectionOutline` and any `Chart.YLine`. Throws outside `Chart.Root`, and when the chart did not come from `BarChart.useBarChart`.',
    },
    'BarChart.Bar': {
      description:
        'A hidden `g` whose computed style paints the bars. Before each paint it takes `data-series`, `data-inactive` and `data-projection` in turn and the bars use its `color`. Its `max-width`, `row-gap` and corner radii in pixels set the bar geometry. Throws outside `BarChart.StackedBars`.',
    },
    'BarChart.ProjectionOutline': {
      description:
        'An `aria-hidden` `rect` that outlines the projected bar, when `projection` rises above its stack. Throws outside `BarChart.StackedBars`.',
    },
  },
  examples: [
    {
      title: 'Stacked bars with a projection',
      code: `
const chart = BarChart.useBarChart({ data, series, index, projection });

<Chart.Root chart={chart} height={320} aria-label='Weekly sign-ups'>
  <BarChart.StackedBars>
    <BarChart.Bar className='bar' />
    <BarChart.ProjectionOutline className='projection-outline' />
    <Chart.YLine value={0} className='zero-line' />
  </BarChart.StackedBars>
  <Chart.Selection>
    <Chart.Tooltip<ActiveBar<Row>>>{active => <PeriodSummary row={active.datum} />}</Chart.Tooltip>
  </Chart.Selection>
</Chart.Root>
`,
    },
    {
      title: 'Dim the bars outside the selected section',
      code: `
const [selection, setSelection] = useState<BarSelection | null>(null);
const isBarActive = useCallback(
  (bar: BarIdentity<Row>) =>
    !selection || (bar.datum.week === selection.category && bar.positive === (selection.section === 'positive')),
  [selection],
);
const chart = BarChart.useBarChart({ data, series, index, selection, onSelectionChange: setSelection, isBarActive });
`,
    },
  ],
  related: ['Chart'],
  exports: {
    'BarChart.useBarChart': {
      description:
        'Lays out stacked bars and owns their selection: `BarChart.useBarChart({ data, series, index })`, plus `categoryGap`, `margin`, `projection`, `isBarActive`, `selection`, `onSelectionChange`, `onActivate` and `formatCategory`. Returns the chart object for `Chart.Root`.',
    },
    'BarChart.CanvasRenderError': {
      description:
        'Thrown when the Canvas 2D context is missing or lost, or painting fails, with the original failure as its `cause`.',
    },
  },
} satisfies ComponentDoc<{
  'BarChart.StackedBars': BarChartStackedBarsProps;
  'BarChart.Bar': BarChartBarProps;
  'BarChart.ProjectionOutline': BarChartProjectionOutlineProps;
}>;
