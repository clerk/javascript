# Skeletons: loading placeholders

A skeleton stands in for content that is being fetched and is not yet on screen. It
has the exact size of that content, so the swap never shifts layout, and every bone
on the page shimmers in sync.

## What to render as bones

When a surface loads as one unit (a panel, a table on first load), render the whole
thing as bones, including titles, card headings and column headers that are already
known: one loading state reads cleaner, shimmers as one surface, and swaps to content in one
moment. A unit is what the user sees appear at once, however many requests feed it.

Content that isn't being fetched keeps rendering. A section loaded by a later request
shows bones beside sections that have already loaded, and a table moving to another
page turns its rows into bones while its headers and controls stay. Whether a table's
controls are bones on first load is still open.

Actions (buttons, menus) are not drawn, but their height is held when it outgrows
the content beside it.

## Building one

Each component defines its own bones, but every bone uses the shared shimmer and the
same fill, `--cl-color-neutral-alpha-200`.

- **Render the real view with mock data.** The view takes `skeleton` and passes it
  to its container (`<Section.Group skeleton={skeleton}>`). Every part inside
  inherits it and becomes a bone (`skeleton={false}` opts one out), drops its
  children, and the container turns `inert` and `aria-hidden`. Because the
  skeleton is the view's own markup, it can't drift from it: change a row and the
  skeleton changes with it. While `skeleton` is set, the view skips its dialogs and
  confirmations.
- **The `.skeleton.tsx` is one line** next to the view, rendering it with a
  `PLACEHOLDER_*` constant:
  `<UserProfileActiveDevicesSectionView skeleton devices={PLACEHOLDER_DEVICES} />`
  (see `user-profile-active-devices-section.skeleton.tsx`). The mock values are
  never shown; they only decide the shape. A panel's skeleton composes its
  sections' skeletons.
- **Mock data decides row count and shape.** Aim it at the most common loaded
  shape: a typical count (2–3), every line present, and the branch real data
  usually takes (a current device, not the empty state). When the count is known
  before the fetch, use it instead: a table moving between pages with a known
  total shows exactly `min(pageSize, total − offset)` rows, so nothing shifts. A
  first load or a new search can't know, so it uses the typical count and accepts
  a shift. The page size is a maximum, not a count.
- **Announce it.** The skeleton is hidden from assistive technology, so the view
  renders a `VisuallyHidden` `role='status'` message ("Loading active devices")
  while `skeleton` is set.
- **Parts also take `skeleton` standalone**, as does `Panel.Title`, for a bone
  outside a skeleton container.
- **Fewest nodes:** one element per bone, no wrappers. A bone is the real part
  rendered empty, so it inherits that part's padding, type size and line height.
- **A component with its own shape** (a part that needs a skeleton but isn't covered
  above) composes the pieces in `styles/skeleton.styles.ts` itself:
  - `skeletonStyles.shimmer`: the gradient fill and its animation. Media and
    blocks take it on the element; `Avatar.Fallback`, which has its own circle,
    takes `shimmer` alone.
  - `skeletonStyles.bone`: radius, for media and blocks (with `shimmer`).
  - `skeletonStyles.line`: a `1lh` box holding one line of text, whose `::before`
    bar is `1cap` tall (`0.7em` fallback) on the baseline, square-cornered. It
    moves the shimmer from the element onto the bar.
  - plus a `useSkeletonShimmer(enabled)` ref (`hooks/use-skeleton-shimmer.ts`) on
    the same element. Without it, the shimmer stays paused.

## Sizing

- **Height must match exactly.** Line bones fill one line of the part's own type, so
  text rows match by construction. Watch anything taller than a line:
  `Section.Actions skeleton` exists because a 28px `sm` menu trigger outgrew a 20px
  line. `Panel.Title skeleton` puts the bone on the inner heading because the outer
  `div` has a smaller line height.
- **Width in `ch`**, from the content the bone usually holds, at the short end, so it
  reads like real text and shrinks with `maxWidth: 100%` on narrow screens: a card or
  page title `6ch`, a label `12ch`, a description `20ch`, an email `16ch`, a US phone
  number `15ch`, a backup code `7ch`. Override a part's default with `xstyle`.
- **Uniform across rows.** Every row uses the same widths; within a row, lines
  differ.

## The shimmer

Modeled on React Spectrum's `Skeleton`: a highlight sweeps left to right across every
bone, and every bone on the page sweeps in step.

- The surface is a `linear-gradient` (fill, highlight, fill at 33% / 50% / 66%)
  sized to `300%` of the bone, and the keyframes move its `background-position`
  from `100%` to `0%`, so the highlight crosses once per cycle: 2s on
  `--cl-ease-in-out`, repeating. The highlight is lighter than the fill in both
  schemes. Off under `prefers-reduced-motion: reduce`, leaving the plain fill.
- Text bones animate their `::before` bar, so the highlight stays inside the cap
  band; media animate the element.
- `useSkeletonShimmer` locks every bone to the document clock: before first paint
  it sets the private `--_cl-skeleton-state` variable (`styles/skeleton.stylex.ts`)
  to `running` and sets each of the element's animations (pseudo-elements
  included) to `startTime = 0`. Bones that mount at different times sweep
  together.
- The animation is `paused` until the hook runs, so a server-rendered skeleton
  holds a static fill until hydration instead of sweeping out of step and jumping.
- The sweep is relative to each bone's width, so a wide bar's highlight moves
  faster than a narrow one's, as in Spectrum.

## When to show it

Not decided by the skeleton. The wiring around a panel owns it. The planned gate is
`useSpinDelay(loading, { delay: 150, minDuration: 500 })` with the skeleton mounted
but `visibility: hidden` until the delay passes, so a fast load never flashes it and
nothing shifts when it appears.

## Checking one

- Add a swingset **Loading** story with a **Reload** button that fakes a load (see
  `section.stories.tsx` → `Loading`).
- Measure, don't eyeball: with `agent-browser`, compare each row's and card's
  `getBoundingClientRect().height` in the skeleton and loaded states. They must be
  equal, except where the number of rows differs.
- Clear swingset's `.next` after any `*.styles.ts` edit.
