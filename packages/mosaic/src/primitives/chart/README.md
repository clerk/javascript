# Chart

Headless charts. A chart-type hook owns the layout and selection and returns a chart object. `Chart.Root` takes any chart object, and the parts render from it. The shared parts draw the root, grid, axes, Y lines, and pointer and keyboard selection with its cursor and tooltip. The parts emit no visual styles: style each one with `className` and `data-*` attributes.

The one chart type today is stacked bars: `Chart.useBarChart` owns the layout and selection, and its marks paint the bars. D3 computes the diverging stacks and scales, Canvas paints the bars and the projection fill, and one SVG over the Canvas holds the projection outline and any `Chart.YLine`.

## When to use

- A stacked bar chart over a category or time axis, with values above and below zero.
- A chart with thousands of bars that still needs keyboard and pointer selection.
- Axes, a grid, reference lines, a cursor or a tooltip for a chart built with a chart-type hook.
- A decorative placeholder chart: leave out `Chart.Selection`.

## Usage

```tsx
import { type ActiveBar, Chart } from '@clerk/mosaic/primitives/chart';

const chart = Chart.useBarChart({ data, series, index, onActivate: openPeriod });

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
  <Chart.Bars>
    <Chart.Bar className='bar' />
    <Chart.ProjectionOutline className='projection-outline' />
    <Chart.YLine
      value={0}
      className='zero-line'
    />
  </Chart.Bars>
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
    <Chart.Tooltip<ActiveBar<Row>>>
      {active => (
        <Chart.TooltipPortal>
          <Chart.TooltipPositioner>
            <Chart.TooltipPopup className='tooltip'>
              <PeriodSummary row={active.datum} />
            </Chart.TooltipPopup>
          </Chart.TooltipPositioner>
        </Chart.TooltipPortal>
      )}
    </Chart.Tooltip>
  </Chart.Selection>
</Chart.Root>;
```

`series` is an ordered list of `{ key, value }`, where `value` reads a number from a row. Rows can be any type. Missing or non-finite values count as zero. `index` returns each row's category key; keys must be unique, because repeated keys share a band. Memoize `series`, `index` and `isBarActive`, or define them at module level: the component that calls `useBarChart` re-renders on every selection change, and a new `series` or `index` prepares the stacks again.

## Parts

| Part                      | Default element | Description                                                          |
| ------------------------- | --------------- | -------------------------------------------------------------------- |
| `Chart.Root`              | `<div>`         | Attaches the chart's measurement and provides the chart to the parts |
| `Chart.Grid`              | `<svg>`         | Holds the grid lines                                                 |
| `Chart.YLine`             | `<line>`        | One line across the plot at a Y value, inside any chart SVG          |
| `Chart.Bars`              | `<div>`         | Paints the bars on Canvas and holds an SVG for the marks above them  |
| `Chart.Bar`               | `<g>`           | Hidden. Its computed style paints the bars                           |
| `Chart.ProjectionOutline` | `<g>`           | Hidden. Its computed stroke outlines the projected bar               |
| `Chart.YAxis`             | `<svg>`         | Holds the Y tick labels in the left margin                           |
| `Chart.YTick`             | `<text>`        | One Y tick label                                                     |
| `Chart.XAxis`             | `<svg>`         | Holds the category labels below the plot                             |
| `Chart.XTick`             | `<text>`        | One category label                                                   |
| `Chart.Selection`         | `<div>`         | Pointer and keyboard selection over the whole chart                  |
| `Chart.Cursor`            | `<div>`         | Covers the selected category                                         |
| `Chart.Tooltip`           | (none)          | Positions a tooltip at the selected category                         |
| `Chart.TooltipPortal`     | (none)          | Portals the tooltip while it is mounted                              |
| `Chart.TooltipPositioner` | `<div>`         | The positioned element. Carries `data-side`                          |
| `Chart.TooltipPopup`      | `<div>`         | The element that animates. Carries `data-open` and `data-closed`     |
| `Chart.TooltipArrow`      | `<svg>`         | An arrow pointing at the selected category                           |

Every part takes `className`, `ref`, `render` and the native props of its default element. `mergeProps` runs the part's props first: `className` concatenates, `style` merges, handlers chain, and yours override everything else.

Every part throws outside `Chart.Root`. `Chart.Bars` also throws when the chart did not come from `Chart.useBarChart`. `Chart.Bar` and `Chart.ProjectionOutline` throw outside `Chart.Bars`, and `Chart.Cursor` and `Chart.Tooltip` throw outside `Chart.Selection`. A `Chart.YLine` inside `Chart.Bars`, such as the zero line, paints over the bars.

The namespace also holds `Chart.useBarChart` and `Chart.CanvasRenderError`.

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

| Prop                | Type                             | Default   | Description                                                                 |
| ------------------- | -------------------------------- | --------- | --------------------------------------------------------------------------- |
| `children`          | `(active: TActive) => ReactNode` | —         | Renders the tooltip parts. While it closes, receives the last selection     |
| `side`              | `'left' \| 'right'`              | `'right'` | The side tried first                                                        |
| `sideOffset`        | `number`                         | `16`      | Distance in px from the category center                                     |
| `collisionPadding`  | `number`                         | `8`       | Space in px kept from the edges of `collisionBoundary`                      |
| `collisionBoundary` | `RefObject<HTMLElement \| null>` | the chart | Element the tooltip stays inside                                            |
| `pinned`            | `boolean \| 'auto'`              | `'auto'`  | Pins the tooltip to the top left of the boundary. `auto` below a 416px plot |

`Chart.Tooltip` renders no element. It provides the context of the [Tooltip primitive](../tooltip/README.md), so `Chart.TooltipPortal`, `Chart.TooltipPositioner`, `Chart.TooltipPopup` and `Chart.TooltipArrow` are the Tooltip parts, anchored to the chart instead of a trigger. Style the popup, not the positioner, which keeps `pointer-events: none` so the tooltip never takes the pointer from the chart.

Name the active type the chart's hook selects, such as `<Chart.Tooltip<ActiveBar<Row>>>`. It defaults to `ChartActive`: the selected `category`, `datumIndex` and `datum`.

### `Chart.useBarChart`

| Option              | Type                                         | Default         | Description                                                        |
| ------------------- | -------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| `data`              | `readonly TDatum[]`                          | (required)      | The rows                                                           |
| `series`            | `readonly BarSeries<TDatum>[]`               | (required)      | Stack order and each series' value                                 |
| `index`             | `(datum: TDatum, index: number) => string`   | (required)      | A unique, stable category key                                      |
| `categoryGap`       | `number`                                     | `0.28`          | Fraction of each category band left empty                          |
| `margin`            | `Partial<ChartMargin>`                       | `8, 16, 36, 52` | Space around the plot for the axes (top, right, bottom, left)      |
| `projection`        | `BarProjection`                              | —               | A projected total, drawn when it rises above its category's stack  |
| `isBarActive`       | `(bar: BarIdentity<TDatum>) => boolean`      | every bar       | Returns false for a bar that `Chart.Bar` styles as `data-inactive` |
| `selection`         | `BarSelection \| null`                       | uncontrolled    | The selected category and section. `null` selects nothing          |
| `onSelectionChange` | `(selection: BarSelection \| null) => void`  | —               | Called when the user, `select` or `clear` changes the selection    |
| `defaultSelection`  | `BarSelection \| null`                       | `null`          | The selection the chart starts with when it holds the selection    |
| `onActivate`        | `(active: ActiveBar<TDatum>, event) => void` | —               | Called on click, Enter or Space, with the event. Makes a button    |
| `disabled`          | `boolean`                                    | `false`         | Ignores the pointer and keyboard and leaves the tab order          |
| `formatCategory`    | `(key: string) => string \| null`            | the key         | Names a period in keyboard announcements                           |
| `formatValue`       | `(value: number) => string`                  | `String`        | Formats a value in keyboard announcements                          |
| `messages`          | `Partial<BarChartMessages>`                  | English         | Screen reader text, including how Up and Down move                 |

A `BarSeries` is `{ key, label?, value }`, and a `BarProjection` is `{ datumIndex, value, label? }`. Announcements name each by its `label`, or by `key` and `messages.projected`. `BarSelection` is `{ category, section }`. A new `isBarActive` function repaints the Canvas. `margin` and the last six options are the [options every chart type takes](#options-every-chart-type-takes). `BarChartMessages` adds `vertical`, `positiveValues`, `negativeValues` and `projected` to `ChartMessages`.

The hook returns a `BarChartInstance<TDatum>`: the [chart object](#the-chart-object) with its value axis, `ActiveBar<TDatum>` as `selected` and `BarCategory` entries in `categories`. A `BarCategory` adds the sections a user can select (`sections`), which sections have values (`hasValues`) and whether the chart draws the projection there (`projected`). Its `x` and `width` are the category band.

`ActiveBar` is the selected period: its `category`, `datumIndex`, `datum` and `section`, plus `hasValues` and `projected`. Name it on the tooltip: `<Chart.Tooltip<ActiveBar<Row>>>`.

## The chart object

A chart-type hook returns a `ChartInstance` plus what its own marks need. A chart with a value axis, such as bars, returns a `CartesianChartInstance`, which adds `scaleY` and `yTicks`:

| Field                   | Type                                     | Description                                                                                          |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `rootRef`               | `(element: HTMLElement \| null) => void` | Measures the element. `Chart.Root` attaches it                                                       |
| `size`                  | `ChartSize`                              | The measured container, zero until the first measurement                                             |
| `plot`                  | `ChartPlot`                              | The plot rectangle inside the margin                                                                 |
| `scaleY`                | `(value: number) => number`              | Cartesian only. Maps a value to a Y coordinate                                                       |
| `yTicks`                | `readonly ChartTick[]`                   | Cartesian only. The Y ticks                                                                          |
| `categories`            | `readonly ChartCategory[]`               | One entry per row: `key`, `datumIndex`, `center`, `x` and `width`                                    |
| `xTicks`                | `(options?: XTicksOptions) => XTick[]`   | The X labels for a tick mode, as `Chart.XAxis` computes them                                         |
| `selected`              | `TActive \| null`                        | The selection in the current data                                                                    |
| `tooltipAnchor`         | `{ x, y } \| null`                       | Where a tooltip for `selected` points                                                                |
| `announcement`          | `string`                                 | The status text for the keyboard selection                                                           |
| `keyboardInstructions`  | `string`                                 | The keys the chart answers to                                                                        |
| `select`, `clear`       | `(selection) => void`, `() => void`      | Change the selection and call `onSelectionChange`                                                    |
| `getInteractionProps()` | `(props?) => ChartInteractionProps`      | Role, `tabIndex`, `ref`, the chart type's `data-*` state and the event handlers, merged with `props` |

A category's `x` and `width` are the extent its marks occupy: a band for bars. Its `center` is where the pointer snaps, the X tick sits and the tooltip anchors. `Chart.Root` and the shared parts hold the chart as a `ChartInstance`, whose `select` takes no value, so only the code that called the hook can select. `Chart.Grid`, `Chart.YAxis` and `Chart.YLine` throw when the chart has no value axis.

## Options every chart type takes

| Option              | Type                                      | Default         | Description                                                                                     |
| ------------------- | ----------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `margin`            | `Partial<ChartMargin>`                    | `8, 16, 36, 52` | Space around the plot for the axes (top, right, bottom, left)                                   |
| `selection`         | `TSelection \| null`                      | uncontrolled    | The selection. `null` selects nothing                                                           |
| `onSelectionChange` | `(selection: TSelection \| null) => void` | —               | Called when the user, `select` or `clear` changes the selection                                 |
| `defaultSelection`  | `TSelection \| null`                      | `null`          | The selection the chart starts with when it holds the selection                                 |
| `onActivate`        | `(active: TActive, event) => void`        | —               | Called on click, Enter or Space, with the mouse or keyboard event. Makes the surface a button   |
| `disabled`          | `boolean`                                 | `false`         | Ignores the pointer and keyboard and leaves the tab order. `select` and `selection` still apply |
| `formatCategory`    | `(key: string) => string \| null`         | the key         | Names a period in keyboard announcements                                                        |
| `formatValue`       | `(value: number) => string`               | `String`        | Formats a value in keyboard announcements                                                       |
| `messages`          | `Partial<ChartMessages>`                  | English         | Screen reader text: `navigate`, `activate`, `dismiss`, `noValues`                               |

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

A pointer selects what the chart type hit-tests under it, and nothing over empty plot. A tap selects on contact and stays selected until the user taps elsewhere, including the empty plot, or the gesture is cancelled.

## Selection

The chart holds the selection unless you pass `selection`, starting from `defaultSelection`. `onSelectionChange` is called whenever a pointer move, a key, a focus change, `select` or `clear` changes it, in both modes. A data change alone does not call it: `chart.selected` resolves the selection against the current data, so a selection whose category disappears reads as null until the user moves. The exception is data that empties, covered below.

Removing the interaction surface, such as unmounting `Chart.Selection`, ends a pointer or keyboard selection and calls `onSelectionChange` with null, as leaving or blurring the surface does. A selection set through `selection` or `select` stays. `Chart.Selection` also removes its surface when the data has no categories.

A controlled `selection` decides what is selected. The chart also remembers two things the value cannot hold, and keeps them only while the controlled value agrees:

- After Escape the selection is `dismissed`: the value is null, and the period is remembered so Enter reselects it instead of activating it. If the consumer then passes a non-null `selection`, that wins.
- Keyboard focus on a period with no values keeps that period for the next arrow key, with a null value.

A selection set through `selection` or `select` is not announced. Announcements follow keyboard moves only.

### Bar sections

Up and Down select the positive or negative section of the period. Left, Right, Home and End keep the section when the new period has it, and otherwise take positive, then negative. When no value in the chart is negative, the keyboard instructions leave Up and Down out.

A pointer selects the period whose center is nearest when it is over a section's bars, or within 24px of the zero line for a shorter section, so a short bar is still a usable target. Over the empty plot above or below the bars it selects nothing. It keeps the current section within a few pixels of the zero line.

The interaction surface carries `data-active-section`, `positive` or `negative` while a section is selected. The status region announces the period and each nonzero value in the section, such as `Feb, Sign-ups 20`, and the projection when the period has one. When some value in the chart is negative, it names the section first: `Feb, negative values, Churned -4`. A period with nothing to select announces `No values for this period`.

Dim every bar outside the selected section by controlling the selection:

```tsx
const [selection, setSelection] = useState<BarSelection | null>(null);
const isBarActive = useCallback(
  (bar: BarIdentity<Row>) =>
    !selection || (bar.datum.week === selection.category && bar.positive === (selection.section === 'positive')),
  [selection],
);
const chart = Chart.useBarChart({ data, series, index, selection, onSelectionChange: setSelection, isBarActive });
```

## Rendering from the chart object

The parts are optional. Attach `rootRef` to the measured element, spread `getInteractionProps()` on the element that takes selection (pass your own handlers to it, and they run after the chart's), and render from the layout fields. Read `rootRef` into its own variable first: the React Compiler lint treats an object whose member is passed to `ref` as a ref, and then flags calls on it during render.

```tsx
const chart = Chart.useBarChart({ data, series, index, onSelectionChange });
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

Painting the bars is the one thing the chart object does not do, because their color and geometry come from `Chart.Bar`'s computed style: keep `Chart.Bars` for that.

## Data attributes

| Attribute                     | Part                      | Description                                                                                                          |
| ----------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `data-chart-interaction-mode` | `Chart.Root`              | `pending` before the first measurement, `interactive` with `Chart.Selection` and categories, otherwise `visual-only` |
| `data-active`                 | `Chart.XTick`             | Present while the tick's period is selected. Calendar boundary labels never carry it                                 |
| `data-active-section`         | `Chart.Selection`         | `positive` or `negative` on the interaction surface while a bar section is selected                                  |
| `data-side`                   | `Chart.TooltipPositioner` | `left` or `right` of the selected period, or `bottom` when pinned to the top of a narrow chart                       |
| `data-open` / `data-closed`   | `Chart.TooltipPopup`      | The tooltip's open state, with `data-starting-style` and `data-ending-style` during transitions                      |

The interaction surface also carries the chart type's state, such as `data-active-section` for bars. `Chart.Bar` takes its own attributes before each paint, listed under [Styling](#styling).

## Accessibility

- The chart type's marks carry `role="img"` and the `aria-label` from `Chart.Root`: for bars, the Canvas. The grid, axes, cursor, lines and projection outline are `aria-hidden`.
- The interaction surface sits outside the image role, so assistive technology can reach it. It is a `button` with `onActivate`, otherwise a `group`, and takes the same `aria-label`. With `disabled` it carries `aria-disabled="true"` and leaves the tab order.
- Visually hidden text describes the keys. A `status` region announces the selected period, named through `formatCategory`, and what the chart type adds. Pass `messages` to localize both.
- An assistive-technology click without coordinates activates the selected period.

## Styling

An unstyled chart is incomplete on purpose: SVG lines without a stroke do not paint, and text without a fill is black. Pass `className` to each item part.

The parts set only the inline styles that layout and behavior depend on: absolute positioning, sizes, `pointer-events`, the tooltip's fixed position and maximum width, `vector-effect` on lines, and the visually hidden announcements. No part sets a z-index. `cursor` is inherited, so a pointer cursor on `Chart.Selection` reaches the interaction surface. `Chart.Cursor` has the selected category's `width`, so it covers a band and has no width over a point.

The primitive reads and writes no CSS variables.

### `Chart.Bar`

Canvas cannot take a class, so the bars are styled through one hidden part. This is the one departure from the part model, where `data-*` attributes stay on the rendered element. `Chart.Bar` renders one `aria-hidden` `<g style="display:none">`. Before each paint, `Chart.Bars` puts it in every state it draws, reads its computed `color`, caches it per state, paints, then restores the element:

| State           | Set on `Chart.Bar`                  |
| --------------- | ----------------------------------- |
| A bar           | `data-series` set to the series key |
| An inactive bar | The same, plus `data-inactive`      |
| The projection  | `data-projection`                   |

Inspect a state by adding the attribute to the part in DevTools and reading its computed `color`. Without `Chart.Bar` nothing is painted, and there is no default color. Style `data-projection` whenever the layout has a projection, or the projection paints in the inherited text color.

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

`Chart.Bar` also sets the bar geometry from its computed style. Only pixel values count:

| CSS on `Chart.Bar`   | Sets                                                    | Unstyled       |
| -------------------- | ------------------------------------------------------- | -------------- |
| `max-width`          | The widest a bar can be, centered in its category band  | Fills the band |
| `row-gap`            | The gap between segments and beside the zero line       | No gap         |
| Top corner radius    | The corners at a stack's outer end, mirrored below zero | Square         |
| Bottom corner radius | Every other corner                                      | Square         |

The geometry is paint only. Selection, the cursor and the scales use the category band. Bars 2px or wider snap their sides to whole device pixels, and the projection also snaps its top, so edges stay crisp at a pixel ratio such as 1.25.

`Chart.ProjectionOutline` styles the outline the Canvas strokes around the projection fill, in the same pass, so the two stay aligned at any pixel ratio. The Canvas reads its computed `stroke`, `stroke-width` and `stroke-dasharray`; unstyled, its `stroke` is `none` and nothing is drawn. The outline leaves a 1px gap outside the fill. The gap, and a stroke one device pixel or wider, round to whole device pixels, so both sides match. Its top corner radius is the fill's plus that offset, so the corners stay concentric, and its sides end square on the zero line.

The Canvas repaints in the same frame when:

- `Chart.Bar` or `Chart.ProjectionOutline` mounts, unmounts or changes `class`
- any attribute on an ancestor of `Chart.Bar`, up to `<html>`, changes and a color the bars paint computes to a new value, so a theme switched through a class, `style`, `data-theme` or any other attribute repaints the bars, and an unrelated attribute change does not
- `prefers-color-scheme` changes and a color the bars paint computes to a new value, so `light-dark()` colors under `color-scheme: light dark` follow the OS
- the pixel ratio changes (capped at 2)
- the layout or the props of `Chart.Bars` change

Other changes to the computed color do not repaint: a stylesheet added or removed, or another media query such as `prefers-contrast`. Change the class of `Chart.Bar` to repaint after one. The backing buffer is resized only when its pixel size changes. The part is `display: none`, so a CSS transition on its color does not animate the bars.

## Paint order

Root does not reorder its children, so paint order is JSX order. Write the parts in this order:

1. `Chart.Grid`
2. The chart type's marks, such as `Chart.Bars`, with any `Chart.YLine` inside their SVG
3. `Chart.YAxis`
4. `Chart.XAxis`
5. `Chart.Selection`, last, so its surface receives the pointer and its cursor paints over the marks

Each container renders nothing until Root has measured a non-zero size.

Inside `Chart.Bars`, the position of `Chart.Bar` and `Chart.ProjectionOutline` does not matter: both are hidden, and the Canvas paints under every `Chart.YLine`.

## Layout

`useBarChart` prepares the stacks when `data`, `series` or `index` change, measures the `rootRef` element, and projects the layout for each size, margin, gap or projection change. `Chart.Bars` projects the bar marks when the layout or the bar geometry changes. The container size is committed before paint, so the chart follows its container while resizing.

The Y scale contains zero and the full positive and negative extents, including an accepted projection, before tick rounding. Gaps and the clearance from the zero line are paint insets: they move no values, ticks or stack endpoints. Insets and radii shrink on small marks so at least one pixel stays visible.

A projection is drawn only when its `value` is finite and rises above its category's positive stack. The category and its `ActiveBar` then carry `projected: true`, and a projection-only category is selectable in its positive section.

Dense paths are clipped into 32-device-pixel columns, which bounds software rasterization work in browsers without GPU rasterization.

A lost or missing 2D context throws `Chart.CanvasRenderError`, with the original failure as its `cause`, so an error boundary can offer a retry that mounts a fresh Canvas.

## Tooltip

`Chart.Tooltip` positions with Floating UI against a virtual element at the chart's `tooltipAnchor`: the selected category's center, at the Y the chart type gives (the top of the plot for bars). It opens on `side`, flips to the other side when that one does not fit inside `collisionBoundary`, and keeps the side it chose last until that side stops fitting, so it does not cross the selection twice near an edge. A keyboard selection starts at the first period, so near the left edge it usually settles on the right. When `pinned`, or by default when the plot is narrower than 416px, it pins to the top-left of the boundary instead. `Chart.TooltipPortal` portals through Mosaic's `Portal`, so a `PortalProvider` decides where. `Chart.TooltipPopup` animates through `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`, and `Chart.Tooltip` passes its children the last selection while the popup closes.

## Dependencies and bundle size

`d3-scale` and `d3-shape` compute the bar stacks and scales. Every `Chart` consumer currently bundles the bar code and d3, about 19KB gzip, even one that uses only the shared parts. The published `Chart` namespace is a single object, so webpack, Rollup and esbuild cannot drop its unused members.

## Adding a chart type

A chart type lives in its own folder under `src/primitives/chart/`, as stacked bars live in `bars/`. Its hook measures with `useChartFrame`, lays out its categories, and passes a pure `SelectionModel` to `useChartInstance`, both from `chart/internal/`. Lint lets only files under `chart/` import `chart/internal/`, and keeps the shared parts at the top of `chart/` out of it. The model owns the hit test from a chart point, where the keyboard lands, how a selection resolves against the data, the announcement and the tooltip's anchor. A chart with a value axis adds `scaleY` and `yTicks` to the instance, as `Chart.useBarChart` does; a chart without one, such as a donut, leaves them out. Its marks read their own layout from a module-private symbol on the instance, as `Chart.Bars` does. Its hook and parts join the `Chart` namespace in `parts.ts`. `line-chart-contract.test-d.ts` checks that a point chart and a chart without a value axis fit the contract.
