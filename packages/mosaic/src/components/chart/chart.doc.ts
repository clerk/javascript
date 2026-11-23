import type { ComponentDoc } from '../../docs-schema';
import type { ChartBarProps, ChartProjectionOutlineProps, ChartStackedBarsProps } from './bars/chart-bars';
import type { ChartLegendProps, ChartTooltipContentProps } from './chart';
import type {
  ChartCursorProps,
  ChartGridProps,
  ChartSelectionProps,
  ChartTooltipProps,
  ChartXAxisProps,
  ChartXTickProps,
  ChartYAxisProps,
  ChartYLineProps,
  ChartYTickProps,
} from './chart-parts';
import type { ChartRootProps } from './chart-root';

export default {
  name: 'Chart',
  description:
    'Styled charts: the parts of the headless `Chart` primitive with Mosaic styles applied, plus `Chart.Legend` and `Chart.TooltipContent`. `Chart.useBarChart` takes rows, a category key and series that each name a color, and returns the chart for `Chart.Root`. Each part renders a sensible default with no children: a dotted grid, formatted ticks, the bars with their projection and zero line, the hover band behind the bars, and a tooltip with one row per series. `Chart.Root` sets each series color, reflects `data-chart` and `data-state` (`ready`, `empty` or `error`), shows the empty state and offers a retry when the Canvas fails. A series color is a palette slot `1` to `6`, which reads `--cl-color-chart-<n>`, or any CSS color.',
  useFor: [
    'a stacked bar chart over a category or time axis',
    'bars with values above and below zero, such as sign-ups and churn',
    'a chart that dims every bar but the selected period or series',
    'a projected total for the current period',
    'a chart legend placed outside the chart, such as in a card header beside an action',
    'a custom chart tooltip with a total, a change badge or a banner',
    'a decorative placeholder chart behind a loading or empty overlay',
  ],
  keywords: [
    'chart',
    'bar chart',
    'stacked bars',
    'graph',
    'data viz',
    'legend',
    'tooltip',
    'projection',
    'series',
    'palette',
    'swatch',
  ],
  practices: [
    {
      do: true,
      text: 'Write the parts in paint order: `Chart.Legend`, `Chart.Grid`, `Chart.StackedBars`, `Chart.YAxis`, `Chart.XAxis`, then `Chart.Selection` last.',
    },
    {
      do: true,
      text: 'Define `series` and `index` at module level or memoize them. A new array or function prepares the stacks again.',
    },
    { do: true, text: 'Give every series a `color`: a palette slot `1` to `6`, or a CSS color with meaning.' },
    {
      do: true,
      text: 'Assign palette slots in order. Avoid slot 2 beside 4, 2 beside 6 and 3 beside 5 in one stack: those pairs are close for some color-blind readers.',
    },
    {
      do: true,
      text: 'Fold anything past eight series into one "Other" series. The hook throws on a ninth series and on a repeated key.',
    },
    {
      do: true,
      text: 'Pass `margin` to `Chart.useBarChart` when you leave out an axis. The default leaves room for both.',
    },
    {
      do: true,
      text: 'Leave out `Chart.Selection` for a decorative chart. It then has no tooltip and takes no focus.',
    },
    {
      do: true,
      text: 'Render a `Skeleton` with the same `height` while the data loads. The chart has no loading state.',
    },
    {
      do: false,
      text: 'Recolor a series from CSS. `cl-chart-bar` carries a position, not your key; change `series[i].color` or a `--cl-color-chart-<n>` token.',
    },
    { do: false, text: 'Use the status colors for series. They mean success, failure and warning.' },
  ],
  parts: {
    'Chart.Root': {
      description:
        'A column (`cl-chart`) with the legend above the plot (`cl-chart-plot`, the headless root). Carries `data-chart="bar"` and `data-state`. Sets `--_cl-chart-series-<i>` for each series, covers the plot with `cl-chart-empty` without rows, and with `cl-chart-error` and a retry when the Canvas fails. The legend is left out in the error state.',
      slot: 'cl-chart',
      props: {
        chart: { type: 'ChartInstance', doc: 'The result of `Chart.useBarChart`.' },
        'aria-label': { type: 'string', doc: 'Names the chart for assistive technology.' },
        height: { type: 'number | string', doc: 'Total height, legend included.', default: '320' },
        renderEmptyState: {
          type: '() => React.ReactNode',
          doc: 'Replaces the default `EmptyState` shown when the chart has no rows.',
        },
        onRenderError: {
          type: '(error: Error) => void',
          doc: 'Called when the Canvas fails to paint, before the built-in retry appears.',
        },
      },
    },
    'Chart.Legend': {
      description:
        'A `ul` of swatch and label pairs. Inside `Chart.Root` it lists the chart series, then a labelled projection as a dashed entry, above the plot. Elsewhere it takes `items`. Each item is `cl-chart-legend-item` with `data-series`, and `data-described` when it has a description, which makes it a focusable tooltip trigger. Swatches are `cl-chart-swatch` with `data-swatch`.',
      slot: 'cl-chart-legend',
      props: {
        items: {
          type: 'readonly ChartLegendItem[]',
          doc: 'The entries, in order: `{ key, label, color, description?, swatch? }`. A `ChartSeries` fits as is.',
          default: 'the chart series',
        },
        children: {
          type: '(item: ChartLegendItem) => React.ReactNode',
          doc: 'Renders an item label. The swatch stays.',
          default: 'item.label',
        },
      },
    },
    'Chart.Grid': {
      description: 'Dotted lines (`cl-chart-grid-line`) at the Y ticks, below the bars.',
      slot: 'cl-chart-grid',
      props: {
        children: {
          type: '(ticks: readonly ChartTick[]) => React.ReactNode',
          doc: 'Replaces the dotted lines.',
        },
      },
    },
    'Chart.YLine': {
      description: 'A solid line at a Y value, such as the zero line inside `Chart.StackedBars`.',
      slot: 'cl-chart-y-line',
      props: {
        value: { type: 'number', doc: 'The value on the Y axis the line marks.' },
      },
    },
    'Chart.StackedBars': {
      description:
        'Paints the bars on Canvas above the cursor, so the hover band shows only in the gaps. Without children it renders `Chart.Bar`, `Chart.ProjectionOutline` and a zero `Chart.YLine`.',
      slot: 'cl-chart-stacked-bars',
    },
    'Chart.Bar': {
      description:
        'The hidden element the Canvas reads. Its `color` is the series color, an opaque 40% mix toward `--cl-color-surface` under `data-inactive`; its `max-width`, `row-gap` and corner radii set the bar geometry.',
      slot: 'cl-chart-bar',
    },
    'Chart.ProjectionOutline': {
      description: 'A dashed outline around the projected total.',
      slot: 'cl-chart-projection-outline',
    },
    'Chart.YAxis': {
      description: 'Value labels beside the plot, left out while the chart has no rows.',
      slot: 'cl-chart-y-axis',
      props: {
        format: {
          type: '(value: number) => React.ReactNode',
          doc: 'Formats a tick value.',
          default: "the hook's `formatValue(value, 'axis')`",
        },
        children: {
          type: '(ticks: readonly ChartYTickItem[]) => React.ReactNode',
          doc: 'Replaces the labels, usually with one `Chart.YTick` per entry.',
        },
      },
    },
    'Chart.YTick': {
      description: 'One value label, in the secondary color with tabular figures.',
      slot: 'cl-chart-y-tick',
      props: { tick: { type: 'ChartYTickItem', doc: 'An entry from the `Chart.YAxis` children function.' } },
    },
    'Chart.XAxis': {
      description: 'Category labels below the plot.',
      slot: 'cl-chart-x-axis',
      props: {
        ticks: {
          type: "'category' | 'calendar'",
          doc: '`category` thins labels to fit. `calendar` labels calendar boundaries, and needs UTC date keys.',
          default: "'category'",
        },
        format: {
          type: '(value: string) => string | null',
          doc: 'Returns the label for a category key, or null to omit it.',
          default: "the hook's `formatCategory(key, 'axis')`",
        },
        children: {
          type: '(ticks: readonly XTick[]) => React.ReactNode',
          doc: 'Replaces the labels, usually with one `Chart.XTick` per entry.',
        },
      },
    },
    'Chart.XTick': {
      description: 'One category label. Takes the foreground color under `data-active`.',
      slot: 'cl-chart-x-tick',
      props: { tick: { type: 'XTick', doc: 'An entry from the `Chart.XAxis` children function.' } },
    },
    'Chart.Selection': {
      description:
        'Pointer and keyboard selection, with a focus ring and a pointer cursor when the hook has `onActivate`. Without children it renders `Chart.Cursor` and `Chart.Tooltip`.',
      slot: 'cl-chart-selection',
    },
    'Chart.Cursor': {
      description: 'The hover band, behind the bars.',
      slot: 'cl-chart-cursor',
    },
    'Chart.Tooltip': {
      description: 'The tooltip surface for the selected period, fading in and out.',
      slot: 'cl-chart-tooltip',
      props: {
        children: {
          type: '(tooltip: ChartTooltipData<TActive>) => React.ReactNode',
          doc: 'Renders the body from `{ active, heading, metrics, rows }`. Return null to hide the tooltip.',
          default: '`Chart.TooltipContent` with the heading, metrics and rows',
        },
        boundaryRef: {
          type: 'React.RefObject<HTMLElement | null>',
          doc: 'Element the tooltip stays inside.',
          default: 'the chart',
        },
      },
    },
    'Chart.TooltipContent': {
      description:
        'The body of a chart tooltip (`cl-chart-tooltip-content`): a heading row (`cl-chart-tooltip-heading`), metrics (`cl-chart-tooltip-metric`), one row per series (`cl-chart-tooltip-row` with `data-series`) and a footer. Values use tabular figures in the foreground color; labels use the secondary color.',
      slot: 'cl-chart-tooltip-content',
      props: {
        heading: { type: 'ReactNode', doc: 'The period or category the tooltip describes.' },
        trailing: { type: 'ReactNode', doc: 'Sits at the end of the heading row, such as a change `Badge`.' },
        metrics: {
          type: 'readonly ChartTooltipMetric[]',
          doc: 'Summary rows, `{ label, value }`, above the series rows.',
          default: '[]',
        },
        rows: {
          type: 'readonly ChartTooltipRow[]',
          doc: 'One row per series: `{ key, label, color, value, swatch? }`, with `value` already formatted.',
          default: '[]',
        },
        footer: { type: 'ReactNode', doc: 'Sits below the rows, such as a `Banner`.' },
      },
    },
  },
  examples: [
    {
      title: 'A stacked bar chart',
      code: `
const series: ChartSeries<Row>[] = [
  { key: 'signups', label: 'Sign-ups', color: 1, value: row => row.signups },
  { key: 'churned', label: 'Churned', color: 3, value: row => row.churned },
];

const chart = Chart.useBarChart({ data: rows, index: getWeek, series });

<Chart.Root chart={chart} aria-label='Weekly growth'>
  <Chart.Legend />
  <Chart.Grid />
  <Chart.StackedBars />
  <Chart.YAxis />
  <Chart.XAxis ticks='calendar' />
  <Chart.Selection />
</Chart.Root>
`,
    },
    {
      title: 'A highlight and a projection',
      code: `
const chart = Chart.useBarChart({
  data: rows,
  index: getWeek,
  series,
  highlight: { category: '2026-02-02', section: 'positive' },
  projection: { datumIndex: rows.length - 1, value: 95, label: 'Projected' },
});
`,
    },
    {
      title: 'A tooltip with a total',
      code: `
<Chart.Selection>
  <Chart.Cursor />
  <Chart.Tooltip<ActiveBar<Row>>>
    {({ active, heading, metrics, rows }) => (
      <Chart.TooltipContent
        heading={heading}
        metrics={[...metrics, { label: 'Total', value: active.datum.signups + active.datum.returning }]}
        rows={rows}
      />
    )}
  </Chart.Tooltip>
</Chart.Selection>
`,
    },
    {
      title: 'A legend in a card header',
      code: `
<header>
  <Chart.Legend items={series} />
  <Button variant='outline'>Export</Button>
</header>
<Chart.Root chart={chart} aria-label='Weekly sign-ups'>
  <Chart.Grid />
  <Chart.StackedBars />
</Chart.Root>
`,
    },
  ],
  related: ['Tooltip', 'EmptyState'],
  exports: {
    'Chart.useBarChart': {
      description:
        'The headless `Chart.useBarChart` with styled data: `Chart.useBarChart({ data, index, series })`, where each series is `{ key, label, color, value, description? }`, plus `highlight` (`{ category?, section?, series? }`, which dims every other bar), `projection` (`{ datumIndex, value, label?, description? }`), `formatValue`, `formatCategory`, `categoryGap`, `margin`, `selection`, `onSelectionChange` and `onActivate`. Returns the chart for `Chart.Root`.',
    },
  },
} satisfies ComponentDoc<{
  'Chart.Root': ChartRootProps;
  'Chart.Legend': ChartLegendProps;
  'Chart.Grid': ChartGridProps;
  'Chart.YLine': ChartYLineProps;
  'Chart.StackedBars': ChartStackedBarsProps;
  'Chart.Bar': ChartBarProps;
  'Chart.ProjectionOutline': ChartProjectionOutlineProps;
  'Chart.YAxis': ChartYAxisProps;
  'Chart.YTick': ChartYTickProps;
  'Chart.XAxis': ChartXAxisProps;
  'Chart.XTick': ChartXTickProps;
  'Chart.Selection': ChartSelectionProps;
  'Chart.Cursor': ChartCursorProps;
  'Chart.Tooltip': ChartTooltipProps;
  'Chart.TooltipContent': ChartTooltipContentProps;
}>;
