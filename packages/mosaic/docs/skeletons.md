# Skeletons: loading placeholders

A skeleton stands in for content that is being fetched and is not yet on screen. It
has the exact size of that content, so the swap never shifts layout, and a highlight
sweeps across every bone.

## What to render as bones

Only fetched content becomes bones. Titles, card headings, column headers and other
text that is known before the fetch stay real text, so the user can see what is
loading.

Content that isn't being fetched keeps rendering. A section loaded by a later request
shows its skeleton beside sections that have already loaded, and a table moving to
another page turns its rows into bones while its headers and controls stay. Whether a
table's controls are bones on first load is still open.

Row actions in a section (menus, buttons) are wrapped with `visible={false}`: they
keep their space, so the row holds its height, but no bone is drawn for them.

## When not to use one

- A single action in flight (a save, a delete) shows a pending button, not a
  skeleton: `SubmitButton`, with `useSpinDelay` for anything else that spins.
- No data is not loading. When the fetch returns nothing, render `EmptyState`;
  never leave a skeleton up as an empty state or as decoration.
- A skeleton holds no working controls. Wrapped content is hidden and the rows
  are `aria-hidden`, and any control kept for its size is `disabled`.

## Building one

A skeleton is its own component in `<feature>.skeleton.tsx`. It draws placeholder rows
with the same components as the view. The view has no skeleton code. See
`src/features/user-profile/user-profile-active-devices-section/`.

- **The component that owns the loading state swaps them.** It renders the
  skeleton while its data loads, then the real view: the active devices section
  returns `<UserProfileActiveDevicesSectionSkeleton />` while its model is
  `loadingDevices`, and `<UserProfileActiveDevicesSectionView />` once it is
  ready.
- **`fallback` is only for while Clerk loads.** A section's own data loading is
  internal and uses its skeleton; callers don't pass anything for it.
- **Wrap what is loading in `Skeleton`** (`src/components/skeleton/`); components
  carry no skeleton code of their own. `Skeleton` always shows unless `show` is
  `false`, as in `<Panel.Title><Skeleton show={loading}>…</Skeleton></Panel.Title>`
  for content that stays mounted.
- **What `Skeleton` draws.** Text children (strings) become a pill bar: one line,
  cap height, on the text's baseline, as wide as the text. Element children become
  a block the size of the element, which stays in the layout but hidden. So wrap
  the text to get a bar, and wrap the text's parent element to cover several lines
  with one block.
- **Shapes are semantic:** `rounded` (the default, `--cl-radius-md`, for media,
  icon frames and buttons), `pill` (`--cl-radius-full`, for avatars and round
  controls) and `square` (`--cl-radius-none`, for image tiles). Text bars are
  always pills. Pick the shape of the element being replaced; don't reach for other
  radii.
- **`visible={false}`** keeps the content's space without drawing a bone.
- **`width` / `height`** size a skeleton that has no children. With children, the
  size comes from them.
- **Placeholder data decides row count, shape, and text length.** Text bars are as
  wide as the placeholder strings, so write them at a typical length, and keep each
  to one line of real content: text bars don't wrap. Aim at the most common loaded
  shape: a typical count (2–3), every line present, and the branch real data
  usually takes (a current device, not the empty state). When the count is known
  before the fetch, use it instead: a table moving between pages with a known
  total shows exactly `min(pageSize, total − offset)` rows. A first load or a new
  search can't know, so it uses the typical count and accepts a shift. The page
  size is a maximum, not a count.
- **Announce it.** The skeleton renders a `VisuallyHidden` `role='status'`
  message ("Loading active devices"), and the view renders its own ("Active
  devices loaded").
- **A component's own loading state** (not a skeleton), such as `Avatar.Fallback`
  while an image loads, takes `skeletonStyles.shimmer` from
  `src/styles/skeleton.styles.ts` for the same highlight.

## Sizing

- **Height must match exactly.** A text bar sits in one line of its parent's type,
  and a block is its element's own size, so wrapped content keeps its height by
  construction. Measure anyway; a mock string that's longer than real content is
  the usual cause of a shift.
- **The text bar is cap height on the baseline.** Its `::before` bar is `1cap`
  tall (`0.7em` fallback) with a `-100%` end margin, so it shares the hidden
  text's baseline and covers the band of its capitals in any font, with nothing
  measured. Stacked lines keep a natural gap.

## The shimmer

Modeled on React Spectrum's `Skeleton`, with no JavaScript: a highlight one bone wide,
peaking in the middle, sweeps left to right across two bone widths, over 1.6s
`ease-in-out` (the CSS keyword, not a token), repeating. Off under
`prefers-reduced-motion: reduce`, leaving the plain fill.

- **Blocks** (wrapped elements, the avatar) move an `::after` overlay with `transform`
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

Not decided by the skeleton. The component that owns the loading state shows it for as
long as the data is loading. The planned gate is
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
