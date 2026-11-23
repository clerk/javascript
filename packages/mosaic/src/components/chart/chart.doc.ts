import type { ComponentDoc } from '../../docs-schema';
import type { ChartLegendProps, ChartTooltipContentProps } from './chart';

export default {
  name: 'Chart',
  description:
    'The styled parts every Mosaic chart shares, driven by plain data. `Chart.Legend` lists series as swatch and label pairs, and `Chart.TooltipContent` lays out a chart tooltip. Neither reads context, so they render above a chart, in a card header or beside a skeleton. A series color is a palette slot `1` to `6`, which reads `--cl-color-chart-<n>`, or any CSS color.',
  useFor: [
    'a chart legend placed outside the chart, such as in a card header beside an action',
    'a custom chart tooltip with a total, a change badge or a banner',
    'the categorical chart palette tokens',
  ],
  keywords: ['chart', 'legend', 'tooltip', 'series', 'palette', 'data viz', 'swatch'],
  practices: [
    {
      do: true,
      text: 'Pass the same `series` array to the chart and to `Chart.Legend`, so every series keeps its color wherever it appears.',
    },
    {
      do: true,
      text: 'Assign palette slots in order. Avoid slot 2 beside 4, 2 beside 6 and 3 beside 5 in one stack: those pairs are close for some color-blind readers.',
    },
    {
      do: false,
      text: 'Color a series by its position in the list. A filtered list would then repaint the series that remain.',
    },
    { do: false, text: 'Use the status colors for series. They mean success, failure and warning.' },
  ],
  parts: {
    'Chart.Legend': {
      description:
        'A `ul` of swatch and label pairs (`cl-chart-legend`). Each item is `cl-chart-legend-item` with `data-series`, and `data-described` when it has a description, which makes it a focusable tooltip trigger. Swatches are `cl-chart-swatch` with `data-swatch`.',
      slot: 'cl-chart-legend',
      props: {
        items: {
          type: 'readonly ChartLegendItem[]',
          doc: 'The entries, in order: `{ key, label, color, description?, swatch? }`. A `ChartSeries` fits as is.',
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
      title: 'A legend in a card header',
      code: `
<header>
  <Chart.Legend items={series} />
  <Button variant='outline'>Export</Button>
</header>
<BarChart aria-label='Weekly sign-ups' data={rows} index={getWeek} series={series} showLegend={false} />
`,
    },
    {
      title: 'A tooltip with a total',
      code: `
<BarChart
  aria-label='Weekly sign-ups'
  data={rows}
  index={getWeek}
  series={series}
  renderTooltip={({ heading, metrics, rows }) => (
    <Chart.TooltipContent heading={heading} metrics={[...metrics, { label: 'Total', value: total }]} rows={rows} />
  )}
/>
`,
    },
  ],
  related: ['BarChart', 'Tooltip'],
} satisfies ComponentDoc<{ 'Chart.Legend': ChartLegendProps; 'Chart.TooltipContent': ChartTooltipContentProps }>;
