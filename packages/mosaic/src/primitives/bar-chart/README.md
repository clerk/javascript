# Bar chart

A headless stacked bar chart: `BarChart.useBarChart` owns the layout and selection, and its marks paint the bars. D3 computes the diverging stacks and scales, Canvas paints the bars and the projection fill, and one SVG over the Canvas holds the projection outline and any `Chart.YLine`. The root, grid, axes, selection, cursor and tooltip are the shared [`Chart`](../chart/README.md) parts. The parts emit no visual styles: style each one with `className` and `data-*` attributes.

## When to use

- A stacked bar chart over a category or time axis, with values above and below zero.
- A chart with thousands of bars that still needs keyboard and pointer selection.
- A decorative placeholder chart: leave out `Chart.Selection`.

## Usage

```tsx
import { type ActiveBar, BarChart } from '@clerk/mosaic/primitives/bar-chart';
import { Chart } from '@clerk/mosaic/primitives/chart';

const chart = BarChart.useBarChart({ data, series, index, onActivate: openPeriod });

<Chart.Root
  chart={chart}
  height={320}
  aria-label='Weekly sign-ups'
>
  <Chart.Grid>
    {ticks =>
      ticks.map(tick => (
        <Chart.YLine
          key={tick.value}
          value={tick.value}
          className='grid-line'
        />
      ))
    }
  </Chart.Grid>
  <BarChart.StackedBars>
    <BarChart.Bar className='bar' />
    <BarChart.ProjectionOutline className='projection-outline' />
    <Chart.YLine
      value={0}
      className='zero-line'
    />
  </BarChart.StackedBars>
  <Chart.YAxis>
    {ticks =>
      ticks.map(tick => (
        <Chart.YTick
          key={tick.value}
          tick={tick}
          className='tick'
        />
      ))
    }
  </Chart.YAxis>
  <Chart.XAxis ticks='calendar'>
    {ticks =>
      ticks.map(tick => (
        <Chart.XTick
          key={tick.key}
          tick={tick}
          className='tick'
        />
      ))
    }
  </Chart.XAxis>
  <Chart.Selection>
    <Chart.Cursor className='cursor' />
    <Chart.Tooltip<ActiveBar<Row>> className='tooltip'>{active => <PeriodSummary row={active.datum} />}</Chart.Tooltip>
  </Chart.Selection>
</Chart.Root>;
```

`series` is an ordered list of `{ key, value }`, where `value` reads a number from a row. Rows can be any type. Missing or non-finite values count as zero. `index` returns each row's category key; keys must be unique, because repeated keys share a band. Memoize `series`, `index` and `isBarActive`, or define them at module level: the component that calls `useBarChart` re-renders on every selection change, and a new `series` or `index` prepares the stacks again.

## Parts

| Part                         | Default element | Description                                                         |
| ---------------------------- | --------------- | ------------------------------------------------------------------- |
| `BarChart.StackedBars`       | `<div>`         | Paints the bars on Canvas and holds an SVG for the marks above them |
| `BarChart.Bar`               | `<g>`           | Hidden. Its computed style paints the bars                          |
| `BarChart.ProjectionOutline` | `<rect>`        | Outlines the projected bar                                          |

Every part takes `className`, `ref`, `render` and the native props of its default element, merged as the [`Chart` parts](../chart/README.md#parts) are.

`BarChart.StackedBars` throws outside `Chart.Root`, and throws when the chart did not come from `BarChart.useBarChart`. `BarChart.Bar` and `BarChart.ProjectionOutline` throw outside `BarChart.StackedBars`. A `Chart.YLine` inside `BarChart.StackedBars`, such as the zero line, paints over the bars.

The namespace also holds `BarChart.useBarChart` and `BarChart.CanvasRenderError`.

## Props

### `BarChart.useBarChart`

| Option              | Type                                        | Default         | Description                                                           |
| ------------------- | ------------------------------------------- | --------------- | --------------------------------------------------------------------- |
| `data`              | `readonly TDatum[]`                         | (required)      | The rows                                                              |
| `series`            | `readonly BarSeries<TDatum>[]`              | (required)      | Stack order and each series' value                                    |
| `index`             | `(datum: TDatum, index: number) => string`  | (required)      | A unique, stable category key                                         |
| `categoryGap`       | `number`                                    | `0.28`          | Fraction of each category band left empty                             |
| `margin`            | `Partial<ChartMargin>`                      | `8, 16, 36, 52` | Space around the plot for the axes (top, right, bottom, left)         |
| `projection`        | `{ datumIndex: number; value: number }`     | —               | A projected total, drawn when it rises above its category's stack     |
| `isBarActive`       | `(bar: BarIdentity<TDatum>) => boolean`     | every bar       | Returns false for a bar that `BarChart.Bar` styles as `data-inactive` |
| `selection`         | `BarSelection \| null`                      | uncontrolled    | The selected category and section. `null` selects nothing             |
| `onSelectionChange` | `(selection: BarSelection \| null) => void` | —               | Called when the user, `select` or `clear` changes the selection       |
| `onActivate`        | `(active: ActiveBar<TDatum>) => void`       | —               | Called on click, Enter or Space. Makes the surface a button           |
| `formatCategory`    | `(key: string) => string \| null`           | the key         | Names a period in keyboard announcements                              |

`BarSelection` is `{ category, section }`. A new `isBarActive` function repaints the Canvas. `margin` and the last four options are the [options every chart type takes](../chart/README.md#options-every-chart-type-takes).

The hook returns a `BarChartInstance<TDatum>`: the [chart object](../chart/README.md#the-chart-object) with `ActiveBar<TDatum>` as `selected` and `BarCategory` entries in `categories`. A `BarCategory` adds the sections a user can select (`sections`), which sections have values (`hasValues`) and whether the chart draws the projection there (`projected`). Its `x` and `width` are the category band.

`ActiveBar` is the selected period: its `category`, `datumIndex`, `datum` and `section`, plus `hasValues` and `projected`. Name it on the tooltip: `<Chart.Tooltip<ActiveBar<Row>>>`.

## Keyboard and selection

Selection follows [`Chart`](../chart/README.md#keyboard). Up and Down select the positive or negative section of the period. Left, Right, Home and End keep the section when the new period has it, and otherwise take positive, then negative. A pointer selects the section above or below the zero line, and keeps the current section within a few pixels of it.

The interaction surface carries `data-active-section`, `positive` or `negative` while a section is selected. The status region announces the period and its section, such as `Feb, positive values`, or `No values for this period`.

Dim every bar outside the selected section by controlling the selection:

```tsx
const [selection, setSelection] = useState<BarSelection | null>(null);
const isBarActive = useCallback(
  (bar: BarIdentity<Row>) =>
    !selection || (bar.datum.week === selection.category && bar.positive === (selection.section === 'positive')),
  [selection],
);
const chart = BarChart.useBarChart({ data, series, index, selection, onSelectionChange: setSelection, isBarActive });
```

Painting the bars is the one thing the chart object does not do, because their color and geometry come from `BarChart.Bar`'s computed style: keep `BarChart.StackedBars` for that.

## Accessibility

The bars Canvas carries `role="img"` and the `aria-label` from `Chart.Root`. The projection outline is `aria-hidden`. The rest is in [`Chart`](../chart/README.md#accessibility).

## Styling

### `BarChart.Bar`

Canvas cannot take a class, so the bars are styled through one hidden part. This is the one departure from the part model, where `data-*` attributes stay on the rendered element. `BarChart.Bar` renders one `aria-hidden` `<g style="display:none">`. Before each paint, `BarChart.StackedBars` puts it in every state it draws, reads its computed `color`, caches it per state, paints, then restores the element:

| State           | Set on `BarChart.Bar`               |
| --------------- | ----------------------------------- |
| A bar           | `data-series` set to the series key |
| An inactive bar | The same, plus `data-inactive`      |
| The projection  | `data-projection`                   |

Inspect a state by adding the attribute to the part in DevTools and reading its computed `color`. Without `BarChart.Bar` nothing is painted, and there is no default color. Style `data-projection` whenever the layout has a projection, or the projection paints in the inherited text color.

```css
.bar[data-series='signups'] {
  --bar: #6d28d9;
}
.bar[data-series='churned'] {
  --bar: #f97316;
}
.bar {
  color: var(--bar);
}
.bar[data-inactive] {
  color: color-mix(in srgb, var(--bar) 50%, white);
}
.bar[data-projection] {
  color: #e5e5e5;
}
```

Tailwind reads `_` inside `data-[…]` as a space, so a key such as `first_active` needs an escaped underscore (`first\_active`), or the selector never matches and that series paints nothing.

`BarChart.Bar` also sets the bar geometry from its computed style. Only pixel values count:

| CSS on `BarChart.Bar` | Sets                                                    | Unstyled       |
| --------------------- | ------------------------------------------------------- | -------------- |
| `max-width`           | The widest a bar can be, centered in its category band  | Fills the band |
| `row-gap`             | The gap between segments and beside the zero line       | No gap         |
| Top corner radius     | The corners at a stack's outer end, mirrored below zero | Square         |
| Bottom corner radius  | Every other corner                                      | Square         |

The geometry is paint only. Selection, the cursor and the scales use the category band. `BarChart.ProjectionOutline` takes its width and corner radius from the same geometry.

The Canvas repaints in the same frame when `BarChart.Bar` mounts, unmounts or changes `class`, when `<html>` changes `class`, `style` or `data-theme`, when the pixel ratio changes (capped at 2), and when the layout or the props of `BarChart.StackedBars` change. The backing buffer is resized only when its pixel size changes. The part is `display: none`, so a CSS transition on its color does not animate the bars.

## Paint order

Follow [`Chart`'s paint order](../chart/README.md#paint-order). Inside `BarChart.StackedBars`, put `BarChart.ProjectionOutline` before the zero `Chart.YLine`. The position of `BarChart.Bar` does not matter.

## Layout

`useBarChart` prepares the stacks when `data`, `series` or `index` change, measures the `rootRef` element, and projects the layout for each size, margin, gap or projection change. `BarChart.StackedBars` projects the bar marks when the layout or the bar geometry changes. The container size is committed before paint, so the chart follows its container while resizing.

The Y scale contains zero and the full positive and negative extents, including an accepted projection, before tick rounding. Gaps and the clearance from the zero line are paint insets: they move no values, ticks or stack endpoints. Insets and radii shrink on small marks so at least one pixel stays visible.

A projection is drawn only when its `value` is finite and rises above its category's positive stack. The category and its `ActiveBar` then carry `projected: true`, and a projection-only category is selectable in its positive section.

Dense paths are clipped into 32-device-pixel columns, which bounds software rasterization work in browsers without GPU rasterization.

A lost or missing 2D context throws `BarChart.CanvasRenderError`, with the original failure as its `cause`, so an error boundary can offer a retry that mounts a fresh Canvas.
