import type { ComponentDoc } from '../../docs-schema';
import type { BarChartProps } from './bar-chart';

export default {
  name: 'BarChart',
  description:
    'A styled stacked bar chart with values above and below zero, over the headless `BarChart` primitive. It renders the legend, a dotted grid, the bars on Canvas, both axes, a hover band behind the bars and a tooltip, and it owns the empty state and a retry after a Canvas failure. The root (`cl-chart`) carries `data-chart="bar"` and `data-state`: `ready`, `empty` or `error`. Pointer and keyboard selection come from the primitive.',
  useFor: [
    'a stacked bar chart over a category or time axis',
    'bars with values above and below zero, such as sign-ups and churn',
    'a chart that dims every bar but the selected period or series',
    'a projected total for the current period',
    'a decorative placeholder chart behind a loading or empty overlay',
  ],
  keywords: ['bar chart', 'stacked bars', 'chart', 'graph', 'data viz', 'legend', 'tooltip', 'projection'],
  practices: [
    {
      do: true,
      text: 'Define `series` and `index` at module level or memoize them. A new array or function prepares the stacks again.',
    },
    { do: true, text: 'Give every series a `color`: a palette slot `1` to `6`, or a CSS color with meaning.' },
    {
      do: true,
      text: 'Fold anything past eight series into one "Other" series. The chart throws on a ninth series and on a repeated key.',
    },
    {
      do: true,
      text: 'Render a `Skeleton` with the same `height` while the data loads. The chart has no loading state.',
    },
    {
      do: false,
      text: 'Recolor a series from CSS. `cl-bar-chart-bar` carries a position, not your key; change `series[i].color` or a `--cl-color-chart-<n>` token.',
    },
  ],
  parts: {
    BarChart: {
      description:
        'The chart. Slots: `cl-chart`, `cl-chart-plot`, `cl-chart-marks`, `cl-bar-chart-bar` (the hidden element the Canvas reads; its `max-width`, `row-gap` and corner radii set the bar geometry), `cl-bar-chart-projection-outline`, `cl-chart-grid-line`, `cl-chart-zero-line`, `cl-chart-tick` (`data-axis`, `data-active`), `cl-chart-selection`, `cl-chart-cursor`, `cl-chart-tooltip`, `cl-chart-empty` and `cl-chart-error`, plus the `Chart.Legend` and `Chart.TooltipContent` slots.',
      slot: 'cl-chart',
      props: {
        'aria-label': { type: 'string', doc: 'Names the chart for assistive technology.' },
        data: { type: 'readonly TDatum[]', doc: 'The rows.' },
        index: {
          type: '(datum: TDatum, index: number) => string',
          doc: 'A unique, stable category key for a row.',
        },
        series: {
          type: 'readonly ChartSeries<TDatum>[]',
          doc: 'Stack order, bottom first: `{ key, label, color, value, description? }`.',
        },
        projection: {
          type: '{ datumIndex: number; value: number; label?: string; description?: string }',
          doc: 'A projected total, drawn when it rises above its row. `label` names it in the legend and tooltip.',
        },
        highlight: {
          type: "{ category?: string; section?: 'positive' | 'negative'; series?: string } | null",
          doc: 'The bars that keep full strength. Every other bar is dimmed. Without it nothing is dimmed.',
        },
        height: { type: 'number | string', doc: 'Total height, legend included.', default: '320' },
        showLegend: {
          type: 'boolean',
          doc: 'Shows the legend above the plot.',
          default: 'true with two or more series or a labelled projection',
        },
        showGrid: { type: 'boolean', doc: 'Shows the horizontal grid lines.', default: 'true' },
        showXAxis: { type: 'boolean', doc: 'Shows the category labels below the plot.', default: 'true' },
        showYAxis: { type: 'boolean', doc: 'Shows the value labels beside the plot.', default: 'true' },
        xTicks: {
          type: "'category' | 'calendar'",
          doc: '`category` thins labels to fit. `calendar` labels calendar boundaries; keys must be UTC dates.',
          default: "'category'",
        },
        formatValue: {
          type: "(value: number, place: 'axis' | 'tooltip') => string",
          doc: 'Formats a value.',
          default: 'locale number, compact on the axis',
        },
        formatCategory: {
          type: "(key: string, place: 'axis' | 'tooltip') => string",
          doc: 'Formats a category key; the tooltip form also names the period in announcements.',
          default: 'the key, or a UTC date under `calendar`',
        },
        interactive: {
          type: 'boolean',
          doc: '`false` draws a picture: no selection, tooltip or tab stop, and the selection props do not type-check.',
          default: 'true',
        },
        selection: {
          type: "{ category: string; section: 'positive' | 'negative' } | null",
          doc: 'The selection, when controlled.',
        },
        onSelectionChange: {
          type: '(selection: BarSelection | null) => void',
          doc: 'Called when the user moves the selection.',
        },
        onActivate: {
          type: '(active: ActiveBar<TDatum>) => void',
          doc: 'Called on click, Enter or Space. Makes the plot a button.',
        },
        renderTooltip: {
          type: '(tooltip: BarChartTooltip<TDatum>) => ReactNode',
          doc: 'Replaces the tooltip body. Spread its fields into `Chart.TooltipContent`. Return null to hide it.',
        },
        renderEmptyState: { type: '() => ReactNode', doc: 'Replaces the default `EmptyState` without rows.' },
        onRenderError: { type: '(error: Error) => void', doc: 'Called when the Canvas fails to paint.' },
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
const getWeek = (row: Row) => row.week;

<BarChart aria-label='Weekly growth' data={rows} index={getWeek} series={series} xTicks='calendar' />
`,
    },
    {
      title: 'Dim every period but the selected one',
      code: `
const [selection, setSelection] = useState<BarSelection | null>(null);

<BarChart
  aria-label='Weekly growth'
  data={rows}
  index={getWeek}
  series={series}
  selection={selection}
  onSelectionChange={setSelection}
  highlight={selection}
/>
`,
    },
  ],
  related: ['Chart', 'EmptyState', 'Skeleton'],
} satisfies ComponentDoc<{ BarChart: BarChartProps<unknown> }>;
