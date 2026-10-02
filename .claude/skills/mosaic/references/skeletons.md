# Skeletons: loading placeholders

A skeleton stands in for content that is being fetched and is not yet on screen. It
has the exact size of that content, so the swap never shifts layout, and every bone
on the page pulses in one shared wave.

## What to render as bones

When a surface loads as one unit (a panel, a table on first load), render the whole
thing as bones, including titles, card headings and column headers that are already
known: one loading state reads cleaner, carries the wave, and swaps to content in one
moment. A unit is what the user sees appear at once, however many requests feed it.

Content that isn't being fetched keeps rendering. A section loaded by a later request
shows bones beside sections that have already loaded, and a table moving to another
page turns its rows into bones while its headers and controls stay. Whether a table's
controls are bones on first load is still open.

Actions (buttons, menus) are not drawn, but their height is held when it outgrows
the content beside it.

## Building one

Each component defines its own bones, but every bone uses the shared wave and the
same fill, `--cl-color-neutral-alpha-200`.

- **Use part props first.** `Section.Group skeleton` makes every Title, Media, Label,
  Description, and Actions inside it a bone, so the parts need no prop of their own
  (`skeleton={false}` opts one out). Parts also take `skeleton` standalone, as does
  `Panel.Title`. A skeleton part renders empty (its children are dropped), so a
  view's own markup can be reused with the group flipped; a skeleton group and
  `Panel.Title` are `inert` and `aria-hidden`.
- **Compose them in a `.skeleton.tsx`** next to the view it mirrors, e.g.
  `user-profile-active-devices-section.skeleton.tsx` exporting
  `UserProfileActiveDevicesSectionSkeleton`. A panel's skeleton composes its
  sections' skeletons. Don't add a `loading` prop to the view.
- **Announce it.** The skeleton is hidden from assistive technology, so render a
  `VisuallyHidden` `role='status'` message ("Loading active devices") beside it.
- **Rows:** a typical count (2–3), not the page size.
- **Fewest nodes:** one element per bone, no wrappers. A bone is the real part
  rendered empty, so it inherits that part's padding, type size and line height.
- **A component with its own shape** (a part that needs a skeleton but isn't covered
  above) composes the pieces in `styles/skeleton.styles.ts` itself:
  - `skeletonStyles.bone`: fill and radius, for media and blocks.
  - `skeletonStyles.line`: a `1lh` box holding one line of text, whose `::before`
    bar is `1cap` tall (`0.7em` fallback) on the baseline, square-cornered.
  - `skeletonStyles.wave`: the animation. `Avatar.Fallback`, which has its own fill
    and circle, takes `wave` alone.
  - plus a `useSkeletonWave(enabled)` ref (`hooks/use-skeleton-wave.ts`) on the same
    element. Without it, `wave` never starts.

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

## The wave

- `skeletonStyles.wave`: opacity `1 → 0.32 → 1` over the first 56% of a 2s cycle,
  then a hold, on `--cl-ease-in-out`. Off under `prefers-reduced-motion: reduce`.
- `useSkeletonWave` sets a negative `animation-delay` before first paint, from the
  element's page position: `-(now − y × 2.1ms/px) mod 2000ms`. Every bone shares
  the document clock and lags it by its height on the page, so skeletons that mount
  separately read as one wave moving down the page, and two lines in one row sit on
  different parts of it.
- `wave` only animates once the hook sets `data-skeleton-wave`. Without that gate, a
  server-rendered skeleton pulses in unison before hydration, then jumps into phase.
- The keyframe duration and the hook's `PERIOD_MS` must match.
- Tuning, all relative: the px rate sets how fast the wave travels; the cycle over
  that rate sets the spacing between crests (~950px, about one per panel); the dip's
  share of the cycle sets how wide a crest is. Shorten the cycle alone and crests
  crowd together; widen the dip alone and the hold disappears.

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
