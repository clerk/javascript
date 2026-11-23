# Chart

The headless parts every chart type shares: the root, grid, axes, Y lines, and pointer and keyboard selection with its cursor and tooltip. A chart-type hook, such as `BarChart.useBarChart` ([`bar-chart/`](../bar-chart/README.md)), owns the layout and selection and returns a chart object. `Chart.Root` takes any chart object, and the shared parts render from it. The parts emit no visual styles: style each one with `className` and `data-*` attributes.

## When to use

- Axes, a grid, reference lines, a cursor or a tooltip for a chart built with a chart-type hook.
- A decorative placeholder chart: leave out `Chart.Selection`.

`Chart` draws no data. Its marks come from the chart type, such as `BarChart.StackedBars`.

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

A container renders only the items its children function returns. A bare `<Chart.XAxis />` renders an empty SVG.

## Parts

| Part              | Default element | Description                                                          |
| ----------------- | --------------- | -------------------------------------------------------------------- |
| `Chart.Root`      | `<div>`         | Attaches the chart's measurement and provides the chart to the parts |
| `Chart.Grid`      | `<svg>`         | Holds the grid lines                                                 |
| `Chart.YLine`     | `<line>`        | One line across the plot at a Y value, inside any chart SVG          |
| `Chart.YAxis`     | `<svg>`         | Holds the Y tick labels in the left margin                           |
| `Chart.YTick`     | `<text>`        | One Y tick label                                                     |
| `Chart.XAxis`     | `<svg>`         | Holds the category labels below the plot                             |
| `Chart.XTick`     | `<text>`        | One category label                                                   |
| `Chart.Selection` | `<div>`         | Pointer and keyboard selection over the whole chart                  |
| `Chart.Cursor`    | `<div>`         | Covers the selected category                                         |
| `Chart.Tooltip`   | `<div>`         | The tooltip for the selected category, portaled                      |

Every part takes `className`, `ref`, `render` and the native props of its default element. `mergeProps` runs the part's props first: `className` concatenates, `style` merges, handlers chain, and yours override everything else.

Every part throws outside `Chart.Root`. `Chart.Cursor` and `Chart.Tooltip` throw outside `Chart.Selection`.

## Props

### `Chart.Root`

| Prop         | Type               | Default    | Description                                        |
| ------------ | ------------------ | ---------- | -------------------------------------------------- |
| `chart`      | `ChartInstance`    | (required) | The result of a chart-type hook                    |
| `aria-label` | `string`           | (required) | Labels the chart image and the interaction surface |
| `height`     | `number \| string` | `500`      | The container height                               |

### `Chart.Grid`, `Chart.YAxis`, `Chart.XAxis`

| Part          | Prop       | Type                                     | Default       | Description                                                                                    |
| ------------- | ---------- | ---------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `Chart.Grid`  | `children` | `(ticks: ChartTick[]) => ReactNode`      | —             | Renders the lines                                                                              |
| `Chart.YAxis` | `format`   | `(value: number) => ReactNode`           | locale number | Formats a tick value                                                                           |
| `Chart.YAxis` | `children` | `(ticks: ChartYTickItem[]) => ReactNode` | —             | Renders the labels                                                                             |
| `Chart.XAxis` | `ticks`    | `'category' \| 'calendar'`               | `'category'`  | `category` thins labels to fit. `calendar` labels calendar boundaries for long UTC date ranges |
| `Chart.XAxis` | `format`   | `(key: string) => string \| null`        | the key       | Labels a category, or returns null to omit it                                                  |
| `Chart.XAxis` | `children` | `(ticks: XTick[]) => ReactNode`          | —             | Renders the labels                                                                             |

`Chart.YLine` takes `value`, the Y value it marks: a grid tick's `value`, `0` for a zero line, or any reference value. `Chart.YTick` and `Chart.XTick` take the `tick` their container passed: `{ value, y, label }` for Y, `{ key, category, label, x, textAnchor }` for X. `XTick.category` is the labelled category key, or null for a calendar boundary label. Calendar labels sit between the centers of the categories dated around them.

`Chart.Selection` and `Chart.Cursor` take only the props of their element.

### `Chart.Tooltip`

| Prop          | Type                             | Default   | Description                                                        |
| ------------- | -------------------------------- | --------- | ------------------------------------------------------------------ |
| `children`    | `(active: TActive) => ReactNode` | —         | Content for the selected category. Return null to hide the tooltip |
| `boundaryRef` | `RefObject<HTMLElement \| null>` | the chart | Element the tooltip stays inside                                   |

Name the active type the chart's hook selects, such as `<Chart.Tooltip<ActiveBar<Row>>>`. It defaults to `ChartActive`: the selected `category`, `datumIndex` and `datum`.

## The chart object

A chart-type hook returns a `ChartInstance` plus what its own marks need:

| Field                   | Type                                     | Description                                                                     |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `rootRef`               | `(element: HTMLElement \| null) => void` | Measures the element. `Chart.Root` attaches it                                  |
| `size`                  | `ChartSize`                              | The measured container, zero until the first measurement                        |
| `plot`                  | `ChartPlot`                              | The plot rectangle inside the margin                                            |
| `scaleY`                | `(value: number) => number`              | Maps a value to a Y coordinate                                                  |
| `yTicks`                | `readonly ChartTick[]`                   | The Y ticks                                                                     |
| `categories`            | `readonly ChartCategory[]`               | One entry per row: `key`, `datumIndex`, `center`, `x` and `width`               |
| `xTicks`                | `(options?: XTicksOptions) => XTick[]`   | The X labels for a tick mode, as `Chart.XAxis` computes them                    |
| `selected`              | `TActive \| null`                        | The selection in the current data                                               |
| `tooltipAnchor`         | `{ x, y } \| null`                       | Where a tooltip for `selected` points                                           |
| `announcement`          | `string`                                 | The status text for the keyboard selection                                      |
| `keyboardInstructions`  | `string`                                 | The keys the chart answers to                                                   |
| `select`, `clear`       | `(selection) => void`, `() => void`      | Change the selection and call `onSelectionChange`                               |
| `getInteractionProps()` | `ChartInteractionProps`                  | Role, `tabIndex`, `ref`, the chart type's `data-*` state and the event handlers |

A category's `x` and `width` are the extent its marks occupy: a band for bars. Its `center` is where the pointer snaps, the X tick sits and the tooltip anchors. `Chart.Root` and the shared parts hold the chart as a `ChartInstance`, whose `select` takes no value, so only the code that called the hook can select.

## Options every chart type takes

| Option              | Type                                      | Default         | Description                                                     |
| ------------------- | ----------------------------------------- | --------------- | --------------------------------------------------------------- |
| `margin`            | `Partial<ChartMargin>`                    | `8, 16, 36, 52` | Space around the plot for the axes (top, right, bottom, left)   |
| `selection`         | `TSelection \| null`                      | uncontrolled    | The selection. `null` selects nothing                           |
| `onSelectionChange` | `(selection: TSelection \| null) => void` | —               | Called when the user, `select` or `clear` changes the selection |
| `onActivate`        | `(active: TActive) => void`               | —               | Called on click, Enter or Space. Makes the surface a button     |
| `formatCategory`    | `(key: string) => string \| null`         | the key         | Names a period in keyboard announcements                        |

## Keyboard

The interaction surface is focusable while something reads the selection: `selection`, `onSelectionChange` or `onActivate` on the hook, or a `Chart.Tooltip`.

| Key                      | Behavior                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `ArrowLeft`/`ArrowRight` | Selects the previous or next period                                      |
| `Home`/`End`             | Selects the first or last period                                         |
| `ArrowUp`/`ArrowDown`    | Moves within the period, as the chart type defines (sections for bars)   |
| `Enter`/`Space`          | Calls `onActivate`. After `Escape`, reselects the dismissed period first |
| `Escape`                 | Clears the selection and remembers the period                            |

Left and Right do not follow `useDirection()`. A time axis reads left to right in every locale, so the earlier period is always on the left.

A pointer selects the category whose center is nearest. A tap selects on contact and stays selected until the user taps elsewhere or the gesture is cancelled.

## Selection

The chart holds the selection unless you pass `selection`. `onSelectionChange` is called whenever a pointer move, a key, a focus change, `select` or `clear` changes it, in both modes. It is not called when data changes: `chart.selected` resolves the selection against the current data, so a selection whose category disappears reads as null until the user moves.

Removing the interaction surface, such as unmounting `Chart.Selection`, ends a pointer or keyboard selection and calls `onSelectionChange` with null, as leaving or blurring the surface does. A selection set through `selection` or `select` stays. `Chart.Selection` also removes its surface when the data has no categories.

A controlled `selection` decides what is selected. The chart also remembers two things the value cannot hold, and keeps them only while the controlled value agrees:

- After Escape the selection is `dismissed`: the value is null, and the period is remembered so Enter reselects it instead of activating it. If the consumer then passes a non-null `selection`, that wins.
- Keyboard focus on a period with no values keeps that period for the next arrow key, with a null value.

A selection set through `selection` or `select` is not announced. Announcements follow keyboard moves only.

## Rendering from the chart object

The parts are optional. Attach `rootRef` to the measured element, spread `getInteractionProps()` on the element that takes selection, and render from the layout fields. Read `rootRef` into its own variable first: the React Compiler lint treats an object whose member is passed to `ref` as a ref, and then flags calls on it during render.

```tsx
const chart = BarChart.useBarChart({ data, series, index, onSelectionChange });
const { rootRef } = chart;

<div ref={rootRef}>
  <div
    {...chart.getInteractionProps()}
    aria-label='Weekly sign-ups'
  >
    {chart.categories.map(category => (
      <span key={category.key}>{category.key}</span>
    ))}
  </div>
  <output>{chart.selected?.category}</output>
</div>;
```

The pointer maps client coordinates through the `rootRef` element's bounds.

## Data attributes

| Attribute                     | Part              | Description                                                                                                          |
| ----------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `data-chart-interaction-mode` | `Chart.Root`      | `pending` before the first measurement, `interactive` with `Chart.Selection` and categories, otherwise `visual-only` |
| `data-active`                 | `Chart.XTick`     | Present while the tick's period is selected. Calendar boundary labels never carry it                                 |
| `data-chart-interaction`      | `Chart.Selection` | On the interaction surface inside the part                                                                           |
| `data-side`                   | `Chart.Tooltip`   | `left` or `right` of the selected period, or `bottom` when pinned to the top of a narrow chart                       |
| `data-open` / `data-closed`   | `Chart.Tooltip`   | The tooltip's open state, with `data-starting-style` and `data-ending-style` during transitions                      |

The interaction surface also carries the chart type's state, such as `data-active-section` for bars.

## Accessibility

- The chart type's marks carry `role="img"` and the `aria-label` from `Chart.Root`. The grid, axes, cursor and lines are `aria-hidden`.
- The interaction surface sits outside the image role, so assistive technology can reach it. It is a `button` with `onActivate`, otherwise a `group`, and takes the same `aria-label`.
- Visually hidden text describes the keys. A `status` region announces the selected period, named through `formatCategory`, and what the chart type adds.
- An assistive-technology click without coordinates activates the selected period.

## Styling

An unstyled chart is incomplete on purpose: SVG lines without a stroke do not paint, and text without a fill is black. Pass `className` to each item part.

The parts set only the inline styles that layout and behavior depend on: absolute positioning, sizes, `pointer-events`, the tooltip's fixed position and maximum width, `vector-effect` on lines, and the visually hidden announcements. No part sets a z-index. `cursor` is inherited, so a pointer cursor on `Chart.Selection` reaches the interaction surface. `Chart.Cursor` has the selected category's `width`, so it covers a band and has no width over a point.

The primitive reads and writes no CSS variables.

## Paint order

Root does not reorder its children, so paint order is JSX order. Write the parts in this order:

1. `Chart.Grid`
2. The chart type's marks, such as `BarChart.StackedBars`, with any `Chart.YLine` inside their SVG
3. `Chart.YAxis`
4. `Chart.XAxis`
5. `Chart.Selection`, last, so its surface receives the pointer and its cursor paints over the marks

Each container renders nothing until Root has measured a non-zero size.

## Tooltip

`Chart.Tooltip` positions with Floating UI against a virtual element at the chart's `tooltipAnchor`: the selected category's center, at the Y the chart type gives (the top of the plot for bars). It opens to the right, flips left when the right side does not fit inside `boundaryRef`, and keeps the side it chose last until that side stops fitting, so it does not cross the selection twice near an edge. When the plot is narrower than 416px, it pins to the top-left of the boundary instead. It portals through Mosaic's `Portal`, so a `PortalProvider` decides where. It animates through `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`, and holds its last content while it closes.

## Adding a chart type

A chart type lives in its own `src/primitives/<type>-chart/` folder. Its hook measures with `useChartFrame`, lays out its categories, and passes a pure `SelectionModel` to `useChartInstance`, both from `chart/internal/`. Lint lets only `*-chart/` folders import `chart/internal/`. The model owns the hit test, where the keyboard lands, how a selection resolves against the data, the announcement and the tooltip's Y. Its marks read their own layout from a module-private symbol on the instance, as `BarChart.StackedBars` does. `line-chart-contract.test-d.ts` checks that a point chart fits the contract.
