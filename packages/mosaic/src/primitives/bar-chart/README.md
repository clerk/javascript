# Bar chart

A headless stacked bar chart: a hook that owns the layout and selection, and composable parts that render from it. D3 computes the diverging stacks and scales, Canvas paints the bars and the projection fill, one SVG over the Canvas draws the grid, axes, zero line and projection outline, and React handles interaction. The parts emit no visual styles: style each one with `className` and `data-*` attributes.

## When to use

- A stacked bar chart over a category or time axis, with values above and below zero.
- A chart with thousands of bars that still needs keyboard and pointer selection.
- A decorative placeholder chart: leave out `BarChart.BarSelection`.

## Usage

```tsx
import { BarChart } from '@clerk/mosaic/primitives/bar-chart';

const chart = BarChart.useBarChart({ data, series, index, onActivate: openPeriod });

<BarChart.Root
  chart={chart}
  height={320}
  aria-label='Weekly sign-ups'
>
  <BarChart.Grid>
    {lines =>
      lines.map(line => (
        <BarChart.GridLine
          key={line.value}
          line={line}
          className='grid-line'
        />
      ))
    }
  </BarChart.Grid>
  <BarChart.StackedBars>
    <BarChart.Bar className='bar' />
    <BarChart.ProjectionOutline className='projection-outline' />
    <BarChart.ZeroLine className='zero-line' />
  </BarChart.StackedBars>
  <BarChart.YAxis>
    {ticks =>
      ticks.map(tick => (
        <BarChart.YTick
          key={tick.value}
          tick={tick}
          className='tick'
        />
      ))
    }
  </BarChart.YAxis>
  <BarChart.XAxis ticks='calendar'>
    {ticks =>
      ticks.map(tick => (
        <BarChart.XTick
          key={tick.key}
          tick={tick}
          className='tick'
        />
      ))
    }
  </BarChart.XAxis>
  <BarChart.BarSelection>
    <BarChart.Cursor className='cursor' />
    <BarChart.Tooltip className='tooltip'>{active => <PeriodSummary row={active.datum} />}</BarChart.Tooltip>
  </BarChart.BarSelection>
</BarChart.Root>;
```

`series` is an ordered list of `{ key, value }`, where `value` reads a number from a row. Rows can be any type. Missing or non-finite values count as zero. `index` returns each row's category key; keys must be unique, because repeated keys share a band. Memoize `series`, `index` and `isBarActive`, or define them at module level: the component that calls `useBarChart` re-renders on every selection change, and a new `series` or `index` prepares the stacks again.

A container renders only the items its children function returns. A bare `<BarChart.XAxis />` renders an empty SVG.

## Parts

| Part                         | Default element | Description                                                          |
| ---------------------------- | --------------- | -------------------------------------------------------------------- |
| `BarChart.Root`              | `<div>`         | Attaches the chart's measurement and provides the chart to the parts |
| `BarChart.Grid`              | `<svg>`         | Holds the grid lines                                                 |
| `BarChart.GridLine`          | `<line>`        | One line across the plot at a Y tick                                 |
| `BarChart.StackedBars`       | `<div>`         | Paints the bars on Canvas and holds an SVG for the marks above them  |
| `BarChart.Bar`               | `<g>`           | Hidden. Its computed style paints the bars                           |
| `BarChart.ProjectionOutline` | `<rect>`        | Outlines the projected bar                                           |
| `BarChart.ZeroLine`          | `<line>`        | The line at zero                                                     |
| `BarChart.YAxis`             | `<svg>`         | Holds the Y tick labels in the left margin                           |
| `BarChart.YTick`             | `<text>`        | One Y tick label                                                     |
| `BarChart.XAxis`             | `<svg>`         | Holds the category labels below the plot                             |
| `BarChart.XTick`             | `<text>`        | One category label                                                   |
| `BarChart.BarSelection`      | `<div>`         | Pointer and keyboard selection over the whole chart                  |
| `BarChart.Cursor`            | `<div>`         | Covers the selected category's band                                  |
| `BarChart.Tooltip`           | `<div>`         | The tooltip for the selected bar, portaled                           |

Every part takes `className`, `ref`, `render` and the native props of its default element. `mergeProps` runs the part's props first: `className` concatenates, `style` merges, handlers chain, and yours override everything else.

Every part throws outside `BarChart.Root`. `BarChart.Bar`, `BarChart.ProjectionOutline` and `BarChart.ZeroLine` live inside `BarChart.StackedBars`, and `BarChart.Bar` and `BarChart.ProjectionOutline` throw outside it. `BarChart.Cursor` and `BarChart.Tooltip` throw outside `BarChart.BarSelection`.

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

`BarSelection` is `{ category, section }`. A new `isBarActive` function repaints the Canvas.

The hook returns a `BarChartInstance<TDatum>`, the chart object:

| Field                   | Type                                              | Description                                                                     |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `rootRef`               | `(element: HTMLElement \| null) => void`          | Measures the element. `BarChart.Root` attaches it                               |
| `size`                  | `ChartSize`                                       | The measured container, zero until the first measurement                        |
| `plot`                  | `ChartPlot`                                       | The plot rectangle inside the margin                                            |
| `scaleY`                | `(value: number) => number`                       | Maps a value to a Y coordinate                                                  |
| `zeroY`                 | `number`                                          | The Y coordinate of zero                                                        |
| `categories`            | `readonly BarCategory[]`                          | One band per row, with its selectable sections                                  |
| `yTicks`                | `readonly ChartTick[]`                            | The Y ticks                                                                     |
| `xTicks`                | `(options?: { mode?, format? }) => XTick[]`       | The X labels for a tick mode, as `BarChart.XAxis` computes them                 |
| `projection`            | `{ datumIndex, x, y, width, height } \| null`     | The accepted projection's band rectangle                                        |
| `selected`              | `ActiveBar<TDatum> \| null`                       | The selected bar in the current data                                            |
| `announcement`          | `string`                                          | The status text for the keyboard selection                                      |
| `select`, `clear`       | `(selection: BarSelection) => void`, `() => void` | Change the selection and call `onSelectionChange`                               |
| `getInteractionProps()` | `BarChartInteractionProps`                        | Role, `tabIndex`, `data-active-section` and the pointer, focus and key handlers |

The object also carries `isBarActive` and the layout internals `prepared` and `step`.

### `BarChart.Root`

| Prop         | Type                       | Default    | Description                                       |
| ------------ | -------------------------- | ---------- | ------------------------------------------------- |
| `chart`      | `BarChartInstance<TDatum>` | (required) | The result of `BarChart.useBarChart`              |
| `aria-label` | `string`                   | (required) | Labels the bars image and the interaction surface |
| `height`     | `number \| string`         | `500`      | The container height                              |

### `BarChart.Grid`, `BarChart.YAxis`, `BarChart.XAxis`

| Part             | Prop       | Type                                        | Default       | Description                                                                                    |
| ---------------- | ---------- | ------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `BarChart.Grid`  | `children` | `(lines: ChartTick[]) => ReactNode`         | —             | Renders the lines                                                                              |
| `BarChart.YAxis` | `format`   | `(value: number) => ReactNode`              | locale number | Formats a tick value                                                                           |
| `BarChart.YAxis` | `children` | `(ticks: BarChartYTickItem[]) => ReactNode` | —             | Renders the labels                                                                             |
| `BarChart.XAxis` | `ticks`    | `'category' \| 'calendar'`                  | `'category'`  | `category` thins labels to fit. `calendar` labels calendar boundaries for long UTC date ranges |
| `BarChart.XAxis` | `format`   | `(key: string) => string \| null`           | the key       | Labels a category, or returns null to omit it                                                  |
| `BarChart.XAxis` | `children` | `(ticks: XTick[]) => ReactNode`             | —             | Renders the labels                                                                             |

`BarChart.GridLine`, `BarChart.YTick` and `BarChart.XTick` each take the entry their container passed: `line` (`{ value, y }`) or `tick` (`{ value, y, label }` for Y, `{ key, category, label, x, textAnchor }` for X). `XTick.category` is the labelled category key, or null for a calendar boundary label.

`BarChart.StackedBars` and `BarChart.BarSelection` take only the props of their element. `isBarActive`, `onActivate` and `formatCategory` are `useBarChart` options.

### `BarChart.Tooltip`

| Prop          | Type                                       | Default   | Description                                                   |
| ------------- | ------------------------------------------ | --------- | ------------------------------------------------------------- |
| `children`    | `(active: ActiveBar<TDatum>) => ReactNode` | —         | Content for the selected bar. Return null to hide the tooltip |
| `boundaryRef` | `RefObject<HTMLElement \| null>`           | the chart | Element the tooltip stays inside                              |

`ActiveBar` is the selected period: its `category`, `datumIndex`, `datum` and `section`, which sections have values (`hasValues`), and whether the chart draws the projection there (`projected`).

## Keyboard

The interaction surface is focusable while something reads the selection: `selection`, `onSelectionChange` or `onActivate` on `useBarChart`, or a `BarChart.Tooltip`.

| Key                      | Behavior                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `ArrowLeft`/`ArrowRight` | Selects the previous or next period                                      |
| `Home`/`End`             | Selects the first or last period                                         |
| `ArrowUp`/`ArrowDown`    | Selects the positive or negative section of the period                   |
| `Enter`/`Space`          | Calls `onActivate`. After `Escape`, reselects the dismissed period first |
| `Escape`                 | Clears the selection and remembers the period                            |

Left and Right do not follow `useDirection()`. A time axis reads left to right in every locale, so the earlier period is always on the left.

A pointer selects the period under it. A tap selects on contact and stays selected until the user taps elsewhere or the gesture is cancelled.

## Selection

The chart holds the selection unless you pass `selection`. `onSelectionChange` is called with `{ category, section }` or null whenever a pointer move, a key, a focus change, `select` or `clear` changes it, in both modes. It is not called when data changes: `chart.selected` resolves the selection against the current data, so a selection whose category or section disappears reads as null until the user moves.

A controlled `selection` decides which bar is selected. The chart also remembers two things the value cannot hold, and keeps them only while the controlled value agrees:

- After Escape the selection is `dismissed`: the value is null, and the period is remembered so Enter reselects it instead of activating it. If the consumer then passes a non-null `selection`, that wins.
- Keyboard focus on a period with no values keeps that period for the next arrow key, with a null value.

A selection set through `selection` or `select` is not announced. Announcements follow keyboard moves only.

```tsx
const [selection, setSelection] = useState<BarSelection | null>(null);
const isBarActive = useCallback(
  (bar: BarIdentity<Row>) =>
    !selection || (bar.datum.week === selection.category && bar.positive === (selection.section === 'positive')),
  [selection],
);
const chart = BarChart.useBarChart({ data, series, index, selection, onSelectionChange: setSelection, isBarActive });
```

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

The pointer maps client coordinates through the `rootRef` element's bounds. Painting the bars is the one thing the object does not do, because their color and geometry come from `BarChart.Bar`'s computed style: keep `BarChart.StackedBars` for that.

## Data attributes

| Attribute                     | Part                    | Description                                                                                                                |
| ----------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `data-chart-interaction-mode` | `BarChart.Root`         | `pending` before the first measurement, `interactive` with `BarChart.BarSelection` and categories, otherwise `visual-only` |
| `data-active`                 | `BarChart.XTick`        | Present while the tick's period is selected. Calendar boundary labels never carry it                                       |
| `data-chart-interaction`      | `BarChart.BarSelection` | On the interaction surface inside the part                                                                                 |
| `data-active-section`         | `BarChart.BarSelection` | On the interaction surface: `positive` or `negative` while a section is selected                                           |
| `data-side`                   | `BarChart.Tooltip`      | `left` or `right` of the selected period, or `bottom` when pinned to the top of a narrow chart                             |
| `data-open` / `data-closed`   | `BarChart.Tooltip`      | The tooltip's open state, with `data-starting-style` and `data-ending-style` during transitions                            |

## Accessibility

- The bars Canvas carries `role="img"` and the `aria-label` from `BarChart.Root`. The grid, axes, cursor and marks are `aria-hidden`.
- The interaction surface sits outside the image role, so assistive technology can reach it. It is a `button` with `onActivate`, otherwise a `group`, and takes the same `aria-label`.
- Visually hidden text describes the keys. A `status` region announces the selected period, named through `formatCategory`, and its section.
- An assistive-technology click without coordinates activates the selected period.

## Styling

An unstyled chart is incomplete on purpose: SVG lines without a stroke do not paint, and text without a fill is black. Pass `className` to each item part.

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

The primitive reads and writes no CSS variables.

### Inline styles

The parts set only the inline styles that layout and behavior depend on: absolute positioning, sizes, `pointer-events`, the tooltip's fixed position and maximum width, `vector-effect` on lines, and the visually hidden announcements. No part sets a z-index. `cursor` is inherited, so a pointer cursor on `BarChart.BarSelection` reaches the interaction surface.

## Paint order

Root does not reorder its children, so paint order is JSX order. Write the parts in this order:

1. `BarChart.Grid`
2. `BarChart.StackedBars`, with `BarChart.ProjectionOutline` before `BarChart.ZeroLine`. The position of `BarChart.Bar` does not matter
3. `BarChart.YAxis`
4. `BarChart.XAxis`
5. `BarChart.BarSelection`, last, so its surface receives the pointer and its cursor paints over the bars

Each container renders nothing until Root has measured a non-zero size.

## Tooltip

`BarChart.Tooltip` positions with Floating UI against a virtual element at the selected period: the band center, at the top of the plot. It opens to the right, flips left when the right side does not fit inside `boundaryRef`, and keeps the side it chose last until that side stops fitting, so it does not cross the bar twice near an edge. When the plot is narrower than 416px, it pins to the top-left of the boundary instead. It portals through Mosaic's `Portal`, so a `PortalProvider` decides where. It animates through `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`, and holds its last content while it closes.

## Layout

`useBarChart` prepares the stacks when `data`, `series` or `index` change, measures the `rootRef` element, and projects the layout for each size, margin, gap or projection change. `BarChart.StackedBars` projects the bar marks when the layout or the bar geometry changes. The container size is committed before paint, so the chart follows its container while resizing.

The Y scale contains zero and the full positive and negative extents, including an accepted projection, before tick rounding. Gaps and the clearance from the zero line are paint insets: they move no values, ticks or stack endpoints. Insets and radii shrink on small marks so at least one pixel stays visible.

A projection is drawn only when its `value` is finite and rises above its category's positive stack. The category and its `ActiveBar` then carry `projected: true`, and a projection-only category is selectable in its positive section.

Dense paths are clipped into 32-device-pixel columns, which bounds software rasterization work in browsers without GPU rasterization.

A lost or missing 2D context throws `BarChart.CanvasRenderError`, with the original failure as its `cause`, so an error boundary can offer a retry that mounts a fresh Canvas.
