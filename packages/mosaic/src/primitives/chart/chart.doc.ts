import type { ComponentDoc } from '../../docs-schema';
import type {
  ChartBarProps,
  ChartBarsProps,
  ChartCursorProps,
  ChartFocusOutlineProps,
  ChartGridProps,
  ChartProjectionOutlineProps,
  ChartRootProps,
  ChartSelectionProps,
  ChartTooltipProps,
  ChartXAxisProps,
  ChartXTickProps,
  ChartYAxisProps,
  ChartYLineProps,
  ChartYTickProps,
} from './parts';

export default {
  name: 'Chart',
  description:
    'Headless, unstyled charts. A chart-type hook owns the layout and selection and returns a chart object; `Chart.Root` takes it, and the parts render from it. The shared parts draw the root, grid, axes, Y lines, and pointer and keyboard selection with its cursor and tooltip. Stacked bars with values above and below zero come from `Chart.useBarChart`: D3 computes the stacks and scales, and `Chart.Bars` paints the bars on Canvas, styled through the hidden `Chart.Bar`. Up and Down select the positive or negative section of a period. Each container renders nothing until the root has a measured, non-zero size.',
  useFor: [
    'a stacked bar chart over a category or time axis',
    'bars with values above and below zero',
    'a chart with thousands of bars that still needs keyboard and pointer selection',
    'axes, a grid and reference lines for a chart',
    'pointer and keyboard selection over a chart, with a cursor and a tooltip',
    'a decorative placeholder chart with no selection',
  ],
  keywords: [
    'chart',
    'graph',
    'bar chart',
    'stacked bars',
    'diverging',
    'projection',
    'canvas',
    'useBarChart',
    'axis',
    'grid',
    'tick',
    'tooltip',
    'cursor',
    'selection',
    'data visualization',
  ],
  practices: [
    {
      do: true,
      text: 'Pass `className` to every item part and style it. An unstyled line has no stroke and an unstyled label is black.',
    },
    {
      do: true,
      text: 'Write the parts in paint order: `Chart.Grid`, the marks of the chart type, `Chart.YAxis`, `Chart.XAxis`, then `Chart.Selection` last.',
    },
    {
      do: true,
      text: 'Name the active type on the tooltip, such as `<Chart.Tooltip<ActiveBar<Row>>>`, so its children get the fields of the chart type.',
    },
    {
      do: true,
      text: 'Leave out `Chart.Selection` for a decorative chart. It then has no interaction surface and takes no focus.',
    },
    {
      do: true,
      text: 'Memoize `series`, `index` and `isBarActive`, or define them at module level. A new `series` or `index` prepares the stacks again on every selection change.',
    },
    { do: true, text: 'Return a unique category key from `index`. Repeated keys share a band.' },
    {
      do: true,
      text: 'Style `Chart.Bar` with a `color` per `data-series`, and `data-projection` whenever there is a projection. Without it nothing is painted.',
    },
    {
      do: true,
      text: 'Catch `Chart.CanvasRenderError` in an error boundary and offer a retry that mounts a fresh chart.',
    },
    {
      do: false,
      text: 'Expect Left and Right to follow `useDirection()`. A time axis reads left to right in every locale.',
    },
    {
      do: false,
      text: 'Render a bare `<Chart.XAxis />` or `<Chart.YAxis />`. A container renders only the items its children function returns.',
    },
    {
      do: false,
      text: 'Animate the bar color with a CSS transition. `Chart.Bar` is `display: none`, so the bars repaint at the end value.',
    },
    {
      do: false,
      text: 'Expect a stylesheet change alone to repaint. Change the class of `Chart.Bar`, or of an ancestor, to repaint.',
    },
  ],
  parts: {
    'Chart.Root': {
      description:
        'A `div` that attaches the measurement of the chart and provides the chart to the parts. Carries `data-chart-interaction-mode`: `pending` before the first measurement, `interactive` with `Chart.Selection` and categories, otherwise `visual-only`.',
      props: {
        chart: { type: 'ChartInstance', doc: 'The result of a chart-type hook, such as `Chart.useBarChart`.' },
        'aria-label': { type: 'string', doc: 'Labels the chart image and the interaction surface.' },
        height: { type: 'number | string', doc: 'The container height.', default: '500' },
      },
    },
    'Chart.Grid': {
      description: 'An `aria-hidden` `svg` over the whole chart that holds the grid lines.',
      props: {
        children: {
          type: '(ticks: readonly ChartTick[]) => React.ReactNode',
          doc: 'Renders the lines, usually one `Chart.YLine` per tick value.',
        },
      },
    },
    'Chart.YLine': {
      description:
        'A `line` across the plot at a Y value, inside any chart SVG: `Chart.Grid`, or the marks of a chart type for a zero line.',
      props: {
        value: { type: 'number', doc: 'The value on the Y axis the line marks, such as a tick value or `0`.' },
      },
    },
    'Chart.Bars': {
      description:
        'A `div` that paints the bars and the projection outline on a Canvas with `role="img"`, and holds one SVG over it for `Chart.Bar`, `Chart.ProjectionOutline` and any `Chart.YLine`. Throws outside `Chart.Root`, and when the chart did not come from `Chart.useBarChart`.',
    },
    'Chart.Bar': {
      description:
        'A hidden `g` whose computed style paints the bars. Before each paint it takes `data-series`, `data-inactive` and `data-projection` in turn and the bars use its `color`. Its `max-width`, `row-gap` and corner radii in pixels set the bar geometry. Throws outside `Chart.Bars`.',
    },
    'Chart.ProjectionOutline': {
      description:
        'A hidden `g` whose computed `stroke`, `stroke-width` and `stroke-dasharray` outline the projected bar on the Canvas, 1px outside its fill, with concentric top corners and square ends on the zero line, when `projection` rises above its stack. Throws outside `Chart.Bars`.',
    },
    'Chart.FocusOutline': {
      description:
        'A `rect` in the `Chart.Bars` SVG around the painted bars of the selected section, rendered only while the keyboard made the selection. Style its `stroke`, `stroke-width` and `rx`; it has `fill: none`. Throws outside `Chart.Bars`.',
      props: {
        offset: { type: 'number', doc: 'Space in px between the painted bars and the outline.', default: '2' },
        minSize: {
          type: 'number',
          doc: 'The smallest width and height in px, so the outline stays findable around thin or short bars.',
          default: '12',
        },
      },
    },
    'Chart.YAxis': {
      description: 'An `aria-hidden` `svg` that holds the Y tick labels in the left margin.',
      props: {
        format: {
          type: '(value: number) => React.ReactNode',
          doc: 'Formats a tick value.',
          default: 'the locale number',
        },
        children: {
          type: '(ticks: readonly ChartYTickItem[]) => React.ReactNode',
          doc: 'Renders the labels, usually one `Chart.YTick` per entry.',
        },
      },
    },
    'Chart.YTick': {
      description: 'One Y tick label, a `text` right-aligned against the plot.',
      props: {
        tick: { type: 'ChartYTickItem', doc: 'An entry from the `Chart.YAxis` children function.' },
      },
    },
    'Chart.XAxis': {
      description: 'An `aria-hidden` `svg` that holds the category labels below the plot.',
      props: {
        ticks: {
          type: "'category' | 'calendar'",
          doc: '`category` thins labels to fit. `calendar` labels calendar boundaries for long ranges, and needs UTC date keys.',
          default: "'category'",
        },
        format: {
          type: '(value: string) => string | null',
          doc: 'Returns the label for a category key, or null to omit it.',
          default: 'the key',
        },
        children: {
          type: '(ticks: readonly XTick[]) => React.ReactNode',
          doc: 'Renders the labels, usually one `Chart.XTick` per entry.',
        },
      },
    },
    'Chart.XTick': {
      description:
        'One category label, a `text` below the plot. Carries `data-active` while its period is selected; a calendar boundary label never does.',
      props: {
        tick: { type: 'XTick', doc: 'An entry from the `Chart.XAxis` children function.' },
      },
    },
    'Chart.Selection': {
      description:
        'A `div` holding the interaction surface: a `button` when the hook has `onActivate`, otherwise a `group`, and a `status` region that announces keyboard moves. Removes its surface when the data has no categories, and unmounting it ends a pointer or keyboard selection.',
    },
    'Chart.Cursor': {
      description:
        'An `aria-hidden` `div` that covers the selected category, with its width. Carries `data-focus-visible` while the keyboard selected the category. Throws outside `Chart.Selection`.',
    },
    'Chart.Tooltip': {
      description:
        'A `div` portaled through `Portal` beside the selected category. Opens on `side`, flips to the other side when it does not fit, and keeps the side it chose last. Pins to the top left of the boundary on a plot narrower than 416px by default. Carries `data-side`, `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`. Throws outside `Chart.Selection`.',
      props: {
        children: {
          type: '(active: TActive) => React.ReactNode',
          doc: 'Content for the selected category. Return null to hide the tooltip.',
        },
        side: { type: "'left' | 'right'", doc: 'The side tried first.', default: "'right'" },
        sideOffset: { type: 'number', doc: 'Distance in px from the category center.', default: '16' },
        collisionPadding: {
          type: 'number',
          doc: 'Space in px kept between the tooltip and the boundary edges.',
          default: '8',
        },
        collisionBoundary: {
          type: 'React.RefObject<HTMLElement | null>',
          doc: 'Element the tooltip stays inside.',
          default: 'the chart',
        },
        pinned: {
          type: "boolean | 'auto'",
          doc: 'Pins the tooltip to the top left of the boundary. `auto` pins it below a 416px plot.',
          default: "'auto'",
        },
      },
    },
  },
  examples: [
    {
      title: 'Stacked bars with axes, a grid, a cursor and a tooltip',
      code: `
const chart = Chart.useBarChart({ data, series, index, onActivate: openPeriod });

<Chart.Root chart={chart} height={320} aria-label='Weekly sign-ups'>
  <Chart.Grid>
    {ticks => ticks.map(tick => <Chart.YLine key={tick.value} value={tick.value} className='grid-line' />)}
  </Chart.Grid>
  <Chart.Bars>
    <Chart.Bar className='bar' />
    <Chart.YLine value={0} className='zero-line' />
  </Chart.Bars>
  <Chart.YAxis>
    {ticks => ticks.map(tick => <Chart.YTick key={tick.value} tick={tick} className='tick' />)}
  </Chart.YAxis>
  <Chart.XAxis ticks='calendar'>
    {ticks => ticks.map(tick => <Chart.XTick key={tick.key} tick={tick} className='tick' />)}
  </Chart.XAxis>
  <Chart.Selection>
    <Chart.Cursor className='cursor' />
    <Chart.Tooltip<ActiveBar<Row>> className='tooltip'>{active => <PeriodSummary row={active.datum} />}</Chart.Tooltip>
  </Chart.Selection>
</Chart.Root>
`,
    },
    {
      title: 'A projected total',
      code: `
const chart = Chart.useBarChart({ data, series, index, projection: { datumIndex: data.length - 1, value: 130 } });

<Chart.Root chart={chart} height={320} aria-label='Weekly sign-ups'>
  <Chart.Bars>
    <Chart.Bar className='bar' />
    <Chart.ProjectionOutline className='projection-outline' />
    <Chart.YLine value={0} className='zero-line' />
  </Chart.Bars>
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
const chart = Chart.useBarChart({ data, series, index, selection, onSelectionChange: setSelection, isBarActive });
`,
    },
  ],
  related: ['Portal'],
  exports: {
    'Chart.useBarChart': {
      description:
        'Lays out stacked bars and owns their selection: `Chart.useBarChart({ data, series, index })`, plus `categoryGap`, `margin`, `projection`, `isBarActive`, `selection`, `defaultSelection`, `onSelectionChange`, `onActivate`, `disabled`, `formatCategory`, `formatValue` and `messages`. Give each series a `label` so announcements name it. Returns the chart object for `Chart.Root`.',
    },
    'Chart.CanvasRenderError': {
      description:
        'Thrown when the Canvas 2D context is missing or lost, or painting fails, with the original failure as its `cause`.',
    },
  },
} satisfies ComponentDoc<{
  'Chart.Root': ChartRootProps;
  'Chart.Grid': ChartGridProps;
  'Chart.YLine': ChartYLineProps;
  'Chart.Bars': ChartBarsProps;
  'Chart.Bar': ChartBarProps;
  'Chart.ProjectionOutline': ChartProjectionOutlineProps;
  'Chart.FocusOutline': ChartFocusOutlineProps;
  'Chart.YAxis': ChartYAxisProps;
  'Chart.YTick': ChartYTickProps;
  'Chart.XAxis': ChartXAxisProps;
  'Chart.XTick': ChartXTickProps;
  'Chart.Selection': ChartSelectionProps;
  'Chart.Cursor': ChartCursorProps;
  'Chart.Tooltip': ChartTooltipProps;
}>;
