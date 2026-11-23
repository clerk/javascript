import type { ComponentDoc } from '../../docs-schema';
import type {
  ChartCursorProps,
  ChartGridProps,
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
    'Headless, unstyled parts every chart type shares: the root, grid, axes, Y lines, and pointer and keyboard selection with its cursor and tooltip. A chart-type hook, such as `BarChart.useBarChart`, owns the layout and selection and returns a chart object; `Chart.Root` takes it and the parts render from it. `Chart` draws no data. Each container renders nothing until the root has a measured, non-zero size.',
  useFor: [
    'axes, a grid and reference lines for a bar chart',
    'pointer and keyboard selection over a chart, with a cursor and a tooltip',
    'a decorative placeholder chart with no selection',
  ],
  keywords: ['chart', 'graph', 'axis', 'grid', 'tick', 'tooltip', 'cursor', 'selection', 'data visualization'],
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
      do: false,
      text: 'Expect Left and Right to follow `useDirection()`. A time axis reads left to right in every locale.',
    },
    {
      do: false,
      text: 'Render a bare `<Chart.XAxis />` or `<Chart.YAxis />`. A container renders only the items its children function returns.',
    },
  ],
  parts: {
    'Chart.Root': {
      description:
        'A `div` that attaches the measurement of the chart and provides the chart to the parts. Carries `data-chart-interaction-mode`: `pending` before the first measurement, `interactive` with `Chart.Selection` and categories, otherwise `visual-only`.',
      props: {
        chart: { type: 'ChartInstance', doc: 'The result of a chart-type hook, such as `BarChart.useBarChart`.' },
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
        'A `div` holding the interaction surface: a `button` when the hook has `onActivate`, otherwise a `group`, with `data-chart-interaction` and a `status` region that announces keyboard moves. Removes its surface when the data has no categories, and unmounting it ends a pointer or keyboard selection.',
    },
    'Chart.Cursor': {
      description:
        'An `aria-hidden` `div` that covers the selected category, with its width. Throws outside `Chart.Selection`.',
    },
    'Chart.Tooltip': {
      description:
        'A `div` portaled through `Portal` for the selected category. Opens to the right, flips left when it does not fit, and pins to the top of a plot narrower than 416px. Carries `data-side`, `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`. Throws outside `Chart.Selection`.',
      props: {
        children: {
          type: '(active: TActive) => React.ReactNode',
          doc: 'Content for the selected category. Return null to hide the tooltip.',
        },
        boundaryRef: {
          type: 'React.RefObject<HTMLElement | null>',
          doc: 'Element the tooltip stays inside.',
          default: 'the chart',
        },
      },
    },
  },
  examples: [
    {
      title: 'Axes, grid, cursor and tooltip around a bar chart',
      code: `
const chart = BarChart.useBarChart({ data, series, index, onActivate: openPeriod });

<Chart.Root chart={chart} height={320} aria-label='Weekly sign-ups'>
  <Chart.Grid>
    {ticks => ticks.map(tick => <Chart.YLine key={tick.value} value={tick.value} className='grid-line' />)}
  </Chart.Grid>
  <BarChart.StackedBars>
    <BarChart.Bar className='bar' />
  </BarChart.StackedBars>
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
  ],
  related: ['BarChart', 'Portal'],
} satisfies ComponentDoc<{
  'Chart.Root': ChartRootProps;
  'Chart.Grid': ChartGridProps;
  'Chart.YLine': ChartYLineProps;
  'Chart.YAxis': ChartYAxisProps;
  'Chart.YTick': ChartYTickProps;
  'Chart.XAxis': ChartXAxisProps;
  'Chart.XTick': ChartXTickProps;
  'Chart.Selection': ChartSelectionProps;
  'Chart.Cursor': ChartCursorProps;
  'Chart.Tooltip': ChartTooltipProps;
}>;
