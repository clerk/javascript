# Skeletons: loading placeholders

A skeleton stands in for content that is being fetched and is not yet on screen. It
has the exact size of that content, so the swap never shifts layout, and a highlight
sweeps across every bone.

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
  inherits it and becomes a bone (`skeleton={false}` opts one out), and the
  container turns `inert` and `aria-hidden`. Because the skeleton is the view's own
  markup, it can't drift from it: change a row and the skeleton changes with it.
  While `skeleton` is set, the view skips its dialogs and confirmations.
- **The `.skeleton.tsx` is one line** next to the view, rendering it with a
  `PLACEHOLDER_*` constant:
  `<UserProfileActiveDevicesSectionView skeleton devices={PLACEHOLDER_DEVICES} />`
  (see `user-profile-active-devices-section.skeleton.tsx`). A panel's skeleton
  composes its sections' skeletons.
- **Mock data decides row count, shape, and text length.** Text bones are drawn
  from the mock strings, so write them at a typical length: a placeholder that
  wraps to two lines where real text takes one shifts the layout. Aim at the most
  common loaded shape: a typical count (2–3), every line present, and the branch
  real data usually takes (a current device, not the empty state). When the count
  is known before the fetch, use it instead: a table moving between pages with a
  known total shows exactly `min(pageSize, total − offset)` rows. A first load or a
  new search can't know, so it uses the typical count and accepts a shift. The page
  size is a maximum, not a count.
- **Announce it.** The skeleton is hidden from assistive technology, so the view
  renders a `VisuallyHidden` `role='status'` message ("Loading active devices")
  while `skeleton` is set.
- **Parts also take `skeleton` standalone**, as does `Panel.Title`, for a bone
  outside a skeleton container.
- **What each part does:** text parts (Title, Label, Description, `Panel.Title`)
  keep their mock text and wrap it in `SkeletonText`; Media renders empty as a
  filled block; Actions render nothing and hold a small control's height.
- **A component with its own shape** composes the pieces in
  `styles/skeleton.styles.ts` itself:
  - `SkeletonText` (`utils/skeleton-text.tsx`) around mock text: one span, one
    line, as wide as its text, drawing a bar with its `::before`. The span is
    `visibility: hidden` and only the bar is visible, so anything nested in the
    mock text (a badge, a link, an icon) keeps its width but never draws. Leave
    badges out of mock rows entirely; a skeleton doesn't draw them.
  - `skeletonStyles.bone`: fill and radius, for media and blocks.
  - `skeletonStyles.shimmer`: the moving highlight for a block, as an `::after`
    overlay. `Avatar.Fallback`, which has its own fill and circle, takes `shimmer`
    alone.

## Sizing

- **Height must match exactly.** Text bones are the text's own line boxes, so text
  rows match by construction. Watch anything taller than its text:
  `Section.Actions skeleton` exists because a 28px `sm` menu trigger outgrew a 20px
  line.
- **The bar is cap height on the baseline.** `SkeletonText` is one line of the
  part's own type (`1lh` tall, so heights match), and its `::before` bar is `1cap`
  tall (`0.7em` fallback), sitting on the baseline with a pill radius. It covers
  the same band as the text's capitals in any font, with nothing measured, and
  stacked lines keep a natural gap.
- **Width comes from the mock text.** The span is `width: fit-content` around its
  transparent mock text, and the bar fills it (a `-100%` end margin keeps the bar
  from taking space in the line, so it shares the text's baseline). So each bar is
  exactly as long as the text it stands in for. Mock text is held to one line
  (`nowrap`, clipped at the part's width), so a long placeholder can't wrap and
  shift the layout; keep placeholders to one line of real content. With no mock
  text, the bar falls back to `12ch`.

## The shimmer

Modeled on React Spectrum's `Skeleton`, with no JavaScript: a highlight one bone wide,
peaking in the middle, sweeps left to right across two bone widths, over 1.6s
`ease-in-out` (the CSS keyword, not a token), repeating. Off under
`prefers-reduced-motion: reduce`, leaving the plain fill.

- **Blocks** (media, the avatar) move an `::after` overlay with `transform`
  (`translateX(-100%)` → `translateX(100%)`), clipped by `overflow: hidden`.
- **Text bars** are themselves a pseudo-element, so they move their own
  background instead: a gradient `300%` wide (transparent, highlight, transparent
  at 33% / 50% / 66%) over the fill, from `background-position: 100%` to `0%`.
  Same geometry and timing as the overlay.
- **The highlight** is a wash over the fill, one value in both techniques:
  background-tinted in light mode, neutral-tinted in dark.
- **No sync.** Bones that mount together sweep together; a section mounting later
  runs out of step. CSS animations keep running through hydration, so a
  server-rendered skeleton doesn't jump.
- The sweep is relative to each bone's width, so a wide bar's highlight moves
  faster than a narrow one's.

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
