# Motion: entrances, exits, and pulses

Token semantics live in `packages/mosaic/src/tokens.stylex.ts`, above
`durationDefaults` / `easingDefaults` — read those comments first. This file is the
how-to layer: the rules that decide a transition's shape, and how to check one
rather than eyeball it.

Named curves come from [easing.dev](https://www.easing.dev) (Lochie Axon's Easing
Graphs). Take one from there rather than inventing a bezier, so the catalog stays
the shared vocabulary.

## `--cl-ease-default` vs `--cl-ease-enter`: count the overshoot in pixels

`--cl-ease-default` is the default, and should stay that way — its ~2% pass past
the target is what makes a surface feel snappy rather than merely fast. What
decides whether that pass is charm or play is how far it actually travels in
pixels, and the arithmetic is worth doing rather than eyeballing: the overshoot is
2% of the **delta**, not of the element.

| what moves                              | travel | overshoot |
| --------------------------------------- | ------ | --------- |
| popover, `scale(0.94 → 1)` at 320px     | 19px   | 0.4px     |
| dialog card, `scale(0.94 → 1)` at 600px | 36px   | 0.7px     |
| sheet, `translate` its own 640px height | 640px  | 15px      |

A scale delta is a few percent of the element, so the pass reaches a whole pixel
only on something far larger than it is applied to: ~725px of width at a 6% delta,
~2,175px at 2%. Menu, Select and Popover `sm` cap at `18rem`, and a wider Popover would have
to be stretched most of the way across the viewport, so `--cl-ease-default` is
right for all of them. It is travel-based motion that crosses the threshold: a
sheet passes its inset by ~15px and visibly corrects; take `--cl-ease-enter`,
which decelerates the same way without the pass-through. Dialog takes it at its
size as a house choice (`dialog.styles.ts`).

For entrances, opacity takes `--cl-ease-enter`: there is nothing
past `1` to overshoot into, so the pass is clamped away and only its cost — the
slower approach to full opacity — is left.

## Repeating pulses

Use `--cl-ease-pulse` for repeating opacity fades such as loading skeletons
(`user-profile-backup-codes.styles.ts`). Its
symmetric curve slows at both ends of each fade, keeping the reversal smooth.
Keep the pulse duration on the component and disable the animation under
`prefers-reduced-motion: reduce`.

## A curve has a direction — don't run the entrance curve backwards

The single most common motion bug in this codebase. `--cl-ease-default` is
front-loaded and carries its endpoint ~2% past target before settling: a change
departs fast and lands soft. That is exactly right for an entrance and wrong in
three separate ways for an exit.

Measured on the Mosaic popover when both directions shared `--cl-ease-default` at
`--cl-duration-base` (scale `1 → 0.94`, 60fps):

```
ms      scale    opacity    Δscale/frame
0       1.0000   1.000         —
33.2    0.9718   0.889      -0.0282   ┐ 90% of the shrink, 3 frames
50.7    0.9552   0.778      -0.0166   │
66.7    0.9465   0.667      -0.0087   ┘
83.4    0.9419   0.555      -0.0046
100.2   0.9397   0.445      -0.0022
117.4   0.9388   0.333      -0.0009   ← dipped BELOW the 0.94 target
133.4   0.9387   0.222      -0.0001
150.5   0.9392   0.111      +0.0005   ← and came back up
167.4   0.9400   0.000      +0.0008
186.0   REMOVED
```

1. **The velocity dies.** 90% of the travel happens in three frames, then six
   frames (~two-thirds of the run) move a combined 0.008. Users report this as
   "choppy" or "dropping frames" — and a performance profile will correctly show
   zero dropped frames. Every frame renders; they are just nearly identical.
2. **The overshoot inverts.** Progress peaks at 1.023, so the value travels _past_
   the target and returns. Arriving, that reads as settling. Leaving, it is a
   wobble with nothing to cover it.
3. **Shape and fade decouple.** Transform finished by ~50ms while a linear opacity
   ran the full 150ms, leaving a motionless fading rectangle.

Use `--cl-ease-exit` on `:where([data-ending-style])`, branching both duration
and timing function (`transitionDuration` / `transitionTimingFunction` in
`popover.styles.ts`). The entrance list is **positional against
`transitionProperty`** (`opacity, transform`) — the fade on `--cl-ease-enter`, the
geometry on the overshoot. The exit collapses to one value because both
properties want the same curve.

### A layout settle is not an exit

`--cl-ease-exit` is for content that is _leaving_: it accelerates away and the abrupt
stop at the end is never seen, because the surface has faded to nothing by then. A
row that collapses behind that content is still there at the end, so the same curve
stops it dead against the content below. That is what `--cl-ease-in-out` is for: the
row starts from rest and returns to rest, matching the content's ease-in at the top
of the curve and easing into the landing at the bottom. See "Expanding and
collapsing a row".

## Asymmetry, in three places

**Duration.** Exits are shorter than entrances — an arrival earns a moment to
settle, a dismissal is an acknowledgement. `--cl-duration-base` in,
`--cl-duration-fast` out, a 1.5:1 ratio. Stay on the duration scale; a ratio that
needs an off-scale value is not worth a new token for one component.

**Opacity leads on the way in.** Give opacity the shorter duration so it lands
opaque as the transform reaches full size, and the settle plays at full strength.
A popup still fading while it moves reads as washed out. On the popover this moved
opacity-at-overshoot-peak from 0.78 to 1.00.

**Exits land together.** Do _not_ split them going out. Matching durations are
what stop an exit reading as a lingering ghost.

## An exit must not show new content

Anything that animates out must hold its last frame for the length of the exit:
`Freeze` around the children, or `useHeldMessage` (`utils/feedback.tsx`) for a
message row. See "Exiting content must be frozen" in `headless.md`.

## Expanding and collapsing a row

The reference is `Card.Banner` (`card.styles.ts`, `banner.collapse` / `clip` /
`surface`). `Field.Message` and `Section.Error` share the measured-height variant:
styles in `styles/feedback.styles.ts`, hooks and `FeedbackBody` in
`utils/feedback.tsx` (see "Inline text", below). Reuse those for a new message row
rather than rebuilding the recipe. It is the recipe to adopt wherever
a row opens and closes around content.

### The content's enter/exit leads; the row is a byproduct

Played together, a row growing around a banner reads as the row: a cell squashing its
content, with a hard clip line moving across it. Two rules take that apart, and they
guarantee different things:

1. **No hard clip edge is ever visible.** The moving edge is the content's own edge
   (it is anchored to it, see Geometry), so nothing is cut there; the stationary edge
   is faded (see the mask).
2. **The row's fast motion happens while the content is invisible.** That is what
   decides prominence: what the eye attaches to is the content arriving and
   leaving, and the row is just the space it takes. Break it and the collapse gets
   ahead of the content's exit, and one motion reads as two.

Rule 2 is met by a different mechanism in each direction, measured on a 54px banner:

- **Enter: delay the content.** The row opens on `--cl-ease-enter` at `slow` and is
  ~85% open at 100ms; the surface waits one `fast` before its own entrance, so it
  arrives into a strip that has all but stopped. The first 100ms is the row moving
  alone, and that is fine: the strip is empty, so nothing is being clipped and it
  reads as space being made. The content is anchored to the moving edge (below), so
  what it does once visible is slide the last few pixels down into place rather
  than be revealed by a line crossing it.
- **Exit: let the curve stagger it.** The surface leaves at once at `fast`; the row
  collapses on `--cl-ease-in-out` at `slow` with no delay. The in-out's slow start
  holds the row within ~7px of rest for that 100ms, so the content has faded to
  nothing by the time the row is moving fast. No delay is needed, and a delayed
  collapse reads as two events.

Both totals land at ~250ms; the asymmetry lives inside the sequence.

### Curves

- **Row opening: `--cl-ease-enter`.** It answers input, so it departs at once like
  everything else that responds to a pointer; `--cl-ease-default` would carry the
  height past target and read as a bounce in the layout.
- **Row closing: `--cl-ease-in-out`** ("A layout settle is not an exit"). Not
  `--cl-ease-enter` either, tempting as one curve for both directions is: its fast start moves the row 16px in the first frame while the
  surface is still at 93% opacity, so the collapse gets ahead of the content's
  ease-in exit and the two read as separate animations with the layout in front —
  rule 2 inverted. The in-out's slow start is what keeps the row still until the
  surface has gone.
- **Surface: the popover recipe.** Opacity at `fast` on `--cl-ease-enter`, scale at
  `base` on `--cl-ease-default`, both at `fast` on `--cl-ease-exit` going out. Scale
  from `0.96` about the **top** edge: the row grows downward from the header, and
  with the content anchored to the moving edge a top origin pulls the surface's
  bottom edge a pixel inside the clip rather than onto it.
- **Inline text: opacity only.** The scale belongs to content that arrives as a
  **surface** — a filled, bordered box such as the banner, which reads as an object
  and can grow into place. A line of text with no box around it (a field error, a
  row-level message) is not an object; scaled, its glyphs visibly shrink and swell
  in place. It takes the same opacity timing and the same entrance delay, and no
  transform at all.

### Durations

The row takes `slow` in both directions. That is not the exception to "exits are
shorter" it looks like: the departure is the surface's `fast` fade, and the row's
collapse is a layout settle that follows it.

These values were tuned on a ~54px row and are **soft guidance**. A row of a very
different height — a one-line message, a whole section — may want a token either
way, and a reviewer stepping it is not violating anything. Check it per frame either
way; the dead-frame test still applies to a short collapse. The one-line inline
messages (`Field.Message`, `Section.Error`) were tried at `base` and read better at
`slow`, so they keep it.

### Geometry

Reference: `card.styles.ts` `banner.collapse` / `clip` / `surface`.

- **Anchor the content to the moving edge** (`align-content: end`). Anchored to the
  top, the content is revealed by the clip line crossing it, and the bottom border is
  the last thing to appear — a hard edge at exactly the moment the row is crawling to
  a stop. Anchored to the bottom, the content's own bottom edge _is_ the moving edge,
  so nothing is ever cut there, and the clipping moves to the top, under the header,
  where content sliding out from under something reads as natural and where there
  is room for a fade (below).

- **The clip layer spans into the implicit second row.** A fractional `fr` track is
  sized twice: the wrapper's height resolves to `f × content`, then the track
  re-resolves against that now-definite height and comes out at `f² × content`. An
  item stretched to the track alone therefore lags the wrapper's edge — by 13px at
  the midpoint of a 54px row — leaving empty space between the clipped content and
  whatever follows, and putting any fade on the wrapper in the wrong place. Spanning
  the implicit row hands the item the wrapper's full height. Measured in Chromium
  and WebKit: `0.62fr` of 54px gives wrapper 33.5 / item 20.8 without the span,
  33.5 / 33.5 with it.

- Padding on the clip layer is the `0fr` track's minimum and holds it open, which is
  why the content's spacing is margins one level down.
- The wrapper cannot sit in a grid parent with a gap: a grid track floors at zero
  no matter how negative an item's margin, so a closed row still costs one gap.
  Give it a flex or gapless parent (`Card.Banner` sits between the header and the
  content grid for exactly this reason). Measured in Chromium and WebKit.
- Measure the height (`useMessageHeight` in `utils/feedback.tsx`) only when the content
  changes size _while open_; `0fr ↔ 1fr` covers open/closed on its own.

### Inline text: the measured-height variant

`Field.Message` swaps one message for another while open (an error becoming a success),
and `0fr ↔ 1fr` cannot animate between two open heights. So the feedback row animates
an explicit `height` from a measured var instead, and the rest of the recipe carries
over: the wrapper is its own clip layer (no padding, `align-content: end`), the exiting
message leaves the flow pinned to the **bottom** (`inset: auto 0 0`) so it rides the
moving edge, and the mask is the same static top fade.

The spacing above a message is the parent's gap, which a closed row must not cost.
Cancel the parent's gap on the wrapper and put it back inside the clip as the
message's margin: one constant that is also the fade's length (`GAP` in
`styles/feedback.styles.ts`). A parent with a different gap sets
`--_cl-feedback-gap`.

A swap while open plays out-then-in rather than overlapping: the old message fades at
`fast`, and the new one's entrance delay holds it until that is done, while the row
eases between the two heights on `--cl-ease-enter`.

### The fade on the clipped edge

A mask on the wrapper, not an element: it needs no background color, works on any
surface a consumer themes, and tracks the box for free because the wrapper's box _is_
the animating track (given the span above — without it the clip edge is somewhere
else).

The `INSET` constant in `card.styles.ts` is both the mask length and the surface's top margin.

That is the whole mask, and it is static. The rule — **the fade exists whenever the
clip edge is crossing content, and is never visible at rest** — is met by geometry
rather than animation: with the content anchored to the moving edge, the only edge
that ever cuts it is the top one, and at rest the top `INSET` of the box is the
content's own top margin, so the ramp ends exactly on the content's top border and
never touches it while the row is still. **The fade's length and the content's top
margin are one constant** — drift between them either eats the border at rest or
leaves a hard strip under the header.

Don't fade the moving edge (top-anchored content plus an animated `mask-size`). It
has to animate away just as the row stops, and every timing read as an artifact.

A hard line at the moving edge is not a fade problem. Before touching the mask,
check the clip layer's height against the wrapper's per frame: if they differ, the
item is sized to the re-resolved track and nothing about the fade can be right (see
the span rule above).

### Reduced motion

The row takes `transition-property: none` and snaps; the mask is static and needs
nothing. The surface keeps its fade and pins the scale (inline text has none to pin), per "Reduced motion" below,
and its entrance delay goes to `instant` as well: it exists to wait for the row, and
a row that has snapped open leaves nothing to wait for.

### Rows in a list

The contact rows in the user profile (`user-profile-contact-list-row.view.tsx`) adopt
the recipe for a `<ul>` whose rows come and go. What differs from the banner:

- **The slot is the `<li>`.** `grid-template-rows` on the list item, the clip layer
  inside it (`grid-row: 1 / span 2`, `min-height: 0`, no padding), and the real row
  rendered as a `div` through `Section.Item`'s `render`. `usePresenceList` keeps a
  removed row mounted, in place and `inert`, until its collapse ends.
- **The entering track starts from `data-starting-style`**, as every other
  transition does. Rows present at the list's first render skip the entering state,
  or the list expands from nothing on load.
- **The track waits out the dialog.** A row is added or removed by a dialog that is
  still animating out when the data lands, and a track that starts at the same moment
  is lost behind it. The slot's transition carries a `base` delay both ways (the
  dialog exits at `fast`, its phone sheet at `base`), and the content's own delays
  are offset by the same amount so they stay relative to the track.
- **One duration and one curve both ways**: `--cl-duration-slower` on
  `--cl-ease-in-out`. The row is still there when either transition ends, so a
  collapse is a layout settle rather than an exit and takes the same curve as the
  expand.
- **Anchored to the start, faded at the bottom.** The row's top border is the list's
  separator, so the content sits at the top of the clip and the border is there from
  the first frame to the last in both directions; the moving edge is the bottom one,
  under a static `mask-image` the height of the row's bottom padding less the focus
  ring's extent, so at rest it touches neither the text nor a focused trigger's
  outline. A row draws its border only when an open slot precedes it: the first row
  has none under the card's own edge, and when a row starts closing the row below it
  drops its line at once rather than meeting the card border and snapping away when
  the closed row unmounts. `Section.Item`'s sibling-marker rule cannot see across
  the slots, so the rule is keyed on the slot.
- **Rows that are already there never enter.** A row locks in whether it animates
  when it first mounts: rows present at the list's first render skip the entering
  state, and a re-render before the first frame must not hand it back to them.
- **The content fade lives on the row's children** (a marker on the row,
  `stylex.when.ancestor` on `Section.Content` and `Section.Actions`), never on the
  row itself: opacity on the row would fade its border too. Inline text takes opacity
  only. It enters after `base + slow` (the track's own `base` delay, then `slow`, so
  the track is ~90% open before text shows; longer than the banner's `fast` because
  this track runs `slower` on in-out), at `base`; it exits at once with the track, at
  `fast`.
- **Reduced motion is a cut.** Every transition off and every value at rest;
  `useTransition` then unmounts an exiting row as soon as it finds nothing to wait
  for.

- **The empty state rides the last row.** Two slots cannot be made to start in the
  same frame, so the empty text is not its own animated row. Every slot has an
  `auto` track above the row's `1fr` track; when a row is the last one, that track
  holds the empty text (`aria-hidden`, opacity 0 under the row), so the slot's
  collapse stops at the empty text's height instead of zero and one track carries
  the whole change: the height moves from the row's to the empty row's, the row's
  content fades out at `fast`, and the empty text fades in after `base + fast`. Once
  the exit ends, a static empty row with no transitions takes its place at the same
  size. The first row added plays this in reverse: its slot mounts at the empty
  text's height with that text visible, which fades out at `fast` as the track opens.

**Rows do not reorder.** While the list is mounted it keeps the order it was first
shown in (`useStableOrder`): a new row is appended, a removed row drops out, and a
row the model now sorts elsewhere stays put. Setting a primary therefore moves the
badge, which enters and exits on the ordinary rules (`base` in on `--cl-ease-enter`
with `scale(0.9 → 1)` on `--cl-ease-default`, `fast` out on `--cl-ease-exit`),
rather than moving rows past each other.

**A pending request shows where its outcome will land.** A set-primary request marks
its row busy at once; once it outlasts `useSpinDelay`'s 150ms, a small `Spinner`
(`role='progressbar'`, named) fades in beside the value, in the spot the badge will
take, and the badge change is held until the spinner has shown for its 400ms
minimum. The old badge then exits at `fast` and the new one enters after a `fast`
delay, so the two never cross; the spinner leaves with the old badge. Both share one
transition (opacity, `scale(0.9 → 1)`, `blur(1px → 0)`) in one grid cell, so neither
shifts the other, and the badge adds half a rem of `translate` toward the row the
primary moves to or arrives from, with the scale's origin left at center. The pending
pattern itself is in "Small elements", below.

## Reflowing siblings

When siblings reflow (an item added or removed), use `useLayoutAnimation` from
`primitives/hooks`; its JSDoc covers the wiring. Set `--cl-layout-duration` /
`--cl-layout-easing` from the duration and easing tokens, not literals.

## Small elements: pills, badges, indicators

The reference is the Primary badge and its pending spinner on the contact rows
(`user-profile-contact-list-row.view.tsx`, `badgeSlotItem`). The tag input's tags
should adopt the same recipe. Everything here is tuned on a ~20px pill; the numbers
do not scale up to surfaces.

**The base transition is the ordinary one.** `base` in with opacity on
`--cl-ease-enter` and `scale(0.9 → 1)` on `--cl-ease-default`, plus any `translate`
on the same curve; `fast` out with all of it on `--cl-ease-exit`. Use the individual `scale` property, not `transform`: a spinner
rotates through a `transform` keyframe, and a `transform: scale()` on the same element
would be overridden by it. The two compose.

**A slight blur, `blur(1px)`, at both ends.** Add `filter` to the transition list,
on `--cl-ease-enter` in and `--cl-ease-exit` out, and drop it to `blur(0)` under
reduced motion with the scale. It reads as the pill resolving into place rather than
switching on.

**Replacing one with another: exit first, then enter.** When a badge moves from one
row to another, or a spinner gives way to a badge, give the entering element a
`transition-delay` equal to the leaving one's exit duration (`fast`), with the delay
dropped on the exit branch. The two then never cross and the eye reads one thing
leaving and another arriving. Without the delay they overlap mid-fade and read as a
flicker.

**Put the two in one cell so neither shifts the other.** A `display: grid` wrapper
with both children at `grid-area: 1 / 1`, start-aligned, and `:empty { display: none }`
so an empty slot adds no gap to the flex row around it. The wrapper's width follows
whichever child is widest, which is the only layout change, and it happens at the
end of the text where nothing follows.

**A pending state shows where its outcome will land.** Mark the container busy at
once, and once the request outlasts `useSpinDelay`'s threshold, fade a small named
`Spinner` (`role='progressbar'`) into the slot the result will take. Hold the result
until the spinner has shown for its minimum, then let the spinner leave with the old
state and the new state arrive after its `fast` delay.

**Spinners are small elements too.** A spinner that appears after a spin delay and
leaves when the work is done takes the same entrance and exit as a badge: opacity,
`scale`, the 1px blur, and the `fast` delay when it is replacing or being replaced by
something in its slot. The contact rows' pending spinner does; `SubmitButton`'s still
snaps its spinner on and off through `opacity` and is the next to adopt it. Keep its
accessibility approach either way: hide a pending spinner with opacity, never
`display` or `visibility`, so the `progressbar` stays in the tree for the whole
action.

## Color and state changes (hover, press)

A state change on an element that is already there and stays there — background,
border, text, or an opacity that only dims it — takes **`linear`, always**. This is
the counterpart to the section above, not an exception to it: a fade that carries a
surface into or out of existence is an entrance, and takes the entrance and exit
curves. A hover is not, and neither is a scrim, which dims the page rather than
arriving on it. Nothing moves, so there is nothing for an ease to sell. Reserve the
curves for geometry.

**The arrival is always `0s`. Only the exit is a judgement call**, and what decides
it is whether a pointer traverses the element on its way somewhere else:

| the highlight sits on…                                             | in   | out     |
| ------------------------------------------------------------------ | ---- | ------- |
| an isolated control — button, card, standalone target              | `0s` | `0.15s` |
| a traversed collection — menu item, list/table row, palette result | `0s` | `0s`    |

**Why the arrival never varies:** it follows from **who caused the change**. You
moved the pointer, so the highlight is confirmation of your own act, and any
duration on it is latency between doing and being told. It is the same reason a
press lands instantly.

**Why the exit does vary:** leaving carries no information, so on an isolated
control 0.15s costs nothing and takes the hard edge off. Across a collection that
same fade becomes a comet trail — a wake of dimming rows strung out behind a fast
sweep, which is the arrival's ambiguity re-introduced from the other side. Rows
leave instantly for the same reason they arrive instantly.

Note the axis is traversal, not element type. A button in a toolbar that the
pointer sweeps across follows the collection row, not the button row.

**The mechanic:** the duration an element carries in a given state governs the
transition _into_ that state. So the asymmetry falls out of one declaration per
state — no doubled values, no JS. See `transitionDuration` in `button.styles.ts`.

The bare `:hover` is safe here only because hover and press carry the same value:
both match during a press, so which one wins does not matter. Give them different
durations and the hover branch needs `:not(:active)`, since the two are equal
specificity and the winner comes down to how StyleX orders them.

Keep the duration itself outside `@media (hover: hover)` either way. A duration is
inert on its own — it times an appearance, and if that appearance is media-guarded
then nothing transitions on a touch device regardless. Wrapping it buys nothing and
costs the `:not(:active)` guard, because the at-rule doubles the class and outranks
`:active` (see `stylex.md`).

Worked examples: `button.styles.ts` for the isolated control, `item.styles.ts` for
the traversed collection — which declares no `transition` at all, since both of its
durations are `0s`. Do not port a button's 0.15s exit onto rows.

### Children need the timing handed to them

**Transitions do not inherit.** A child that recolors along with its container — a
`Button`'s `Icon`, anything reading a `--_cl-*` color the parent branches per state —
animates on _its own_ `transition-duration`, not the parent's. Give the parent one
timing and the child another and the child visibly trails it; at `0s` in, a child
still on `0.1s` reads as the icon lagging the button by a tenth of a second.

Hand the duration down the same way the color goes down, so one declaration governs
both and they cannot drift apart: `--_cl-icon-duration` in `button.styles.ts`, read
in `icon.styles.ts`.

**The child's default is `instant`, not a middling fade.** The arrival never varies,
so any non-zero default is wrong for every container at once; the exit is the only
contextual half, and a container that wants one opts in through the var. That also
makes the standalone default correct for a traversed collection with no work — a row
gets `0s` both ways by doing nothing. The `transitionProperty` and
`transitionTimingFunction` still have to be declared even though the default duration
makes them inert, since they are what the var has to animate once a container sets it.

### A keyword cannot tween — reach for its color-valued sibling

Some properties that read as visual are discrete keywords, so they flip between
frames no matter what duration you set. `text-decoration-line` is the one that bites:
toggling `none` → `underline` on hover gives an instant arrival, which is right by
accident, and an instant exit, which is not.

Draw the thing permanently and animate the color instead (`textDecorationColor` in
`button.styles.ts`, with `text-decoration-color` in its `transitionProperty`).

It costs nothing — a transparent decoration paints nothing and never participates in
layout — and it keeps the change a **color**, so the rule above applies unaltered
rather than needing a curve. Verified in Chrome and Safari; where a browser declines
to interpolate it, the failure is graceful, since it snaps exactly as it does today.

Prefer this to the other animatable decoration properties.
`text-decoration-thickness` from `0` renders unreliably at sub-pixel values, and
`text-underline-offset` makes the underline _slide_, which is movement — that breaks
the "nothing moves" premise the linear curve rests on.

### Three things that look like this and are not

- **An element arriving** — tooltip, popover, dropdown, anything that mounts on
  hover. That is an entrance, not a state change; it gets a real duration and a
  curve. The rest of this file applies instead.
- **System-driven changes** — going disabled, a loading dim, a validation color.
  Instant only reads as confirmation when the user just acted; when the system
  acted it reads as a flash. Keep those symmetric and on the duration scale.
- **Anything moving alongside the color** — a sliding thumb, a drawing check. The
  color has to take the movement's duration or the two desync. "Nothing moves" is
  the premise that licenses both the linear curve and the instant arrival.

### Why the arrival must be `0s`, seen most clearly in dense collections

Menu items, list and table rows, command-palette results — anywhere a pointer
crosses many targets on its way somewhere — is where a non-zero fade-in stops being
a question of taste. The highlight's job there is to answer _which row am I on_, and
a transition makes it unable to. Mosaic `Item` rows are 52px, so at ordinary pointer
speeds a 100ms fade leaves several rows partly lit at once, the brightest of them
trailing behind the cursor:

| pointer speed | ms/row | rows mid-transition |
| ------------- | ------ | ------------------- |
| 300 px/s      | 173    | 0.6                 |
| 600 px/s      | 87     | 1.2                 |
| 900 px/s      | 58     | 1.7                 |
| 1200 px/s     | 43     | 2.3                 |
| 2000 px/s     | 26     | 3.8                 |

Users report this as lag, and they are describing it accurately — the highlight is
behind the pointer. It is a legibility failure, not a matter of polish, and no
duration short enough to fix it is long enough to be worth having. Instant tracking
is also what platform menus have always done.

The same arithmetic sizes the comet trail: a 0.15s exit is a longer fade than the
0.1s modelled above, so it strings out proportionally more rows behind the pointer.
That is why the exit collapses to `0s` here even though it stays at 0.15s on a
button.

## Small deltas constrain the curve (the dead-frame test)

A transition's usable curves depend on how much it actually moves. A scale delta
of 0.06 over 100ms is six frames; a sharply back-loaded curve puts half of them
below the threshold of visible change and re-creates the stall-then-lurch above.
Scored for that exit — _dead_ = frames moving <0.003, _ramp_ = largest frame step
÷ smallest:

| curve                                   | dead | ramp  |
| --------------------------------------- | ---- | ----- |
| linear                                  | 0    | 1.0×  |
| In `(0.42, 0, 1, 1)` — the CSS keyword  | 1    | 5.9×  |
| **In Quad `(0.55, 0.085, 0.68, 0.53)`** | 1    | 6.6×  |
| In Cubic `(0.55, 0.055, 0.675, 0.19)`   | 2    | 17.9× |
| In Quart `(0.895, 0.03, 0.685, 0.22)`   | 3    | >50×  |
| In Circ `(0.6, 0.04, 0.98, 0.335)`      | 2    | 32.0× |

Hence In Quad, the gentlest of the in-family. Counterintuitively, a **longer**
duration makes this worse, not better: the delta is fixed, so more frames means
smaller steps and more of them below threshold (In Cubic goes from 2 dead frames
at 100ms to 4 at 150ms). If a curve stalls, shorten the duration or increase the
delta — don't stretch it.

## `transform-origin`: anchor it to the trigger

For anything anchored to a trigger, scale about the **trigger**, not the element's
own center, so it reads as emerging from what opened it. `cssVars` in
`packages/mosaic/src/primitives/utils/css-vars.ts` emits two origins on the floating
element (`--cl-transform-origin`, the nearest edge, and `--cl-anchor-origin`, the
anchor's center; see its JSDoc). Custom properties inherit, so a popup one level
down reads them directly. Use a var, not a keyword origin: keywords anchor to the
element's own box and drift off the trigger when `shift()` or `flip()` moves it.

**Do not redefine `--cl-transform-origin`** — Menu branches consume it with the
edge semantics. Add a var instead.

The var is unset for the first frame of a cold mount, but the element is
`opacity: 0` with `transition: none` then, so the origin is always correct before
anything animates.

**Geometry.** Travel = `(1 − startScale) × distance(origin, element center)`, so
origin and start scale must be chosen together — at `scale(0.98)` a trigger-center
origin moves ~2px and is invisible; the popover uses `0.94` (~6px). Note the
distance, not the trigger's size, is what matters: on a centered placement the
trigger's center sits directly above/below the popup's, so trigger width cancels
out entirely no matter how wide it is. The one bad case is a **wide trigger with a
much narrower `-start`/`-end` popup**; matching the popup's width to the trigger
puts the origin back on its center.

### Hold the travel constant, not the scale

**~6px of travel is the target.** It reads as emerging from the trigger without
becoming a visible arc. The popover hits it at `0.94` because its origin sits
~103px from the popup's center.

Scale is the dial, not the constant. Because travel is `(1 − s) × d`, a taller
popup pushes its own center further from the trigger, `d` grows, and the same
`0.94` overshoots the target — a large surface swinging 15px reads as
overexaggerated. Solve for the scale instead:

```
s = 1 − (6 / d)      d = distance from --cl-anchor-origin to the element's center
```

| `d`   | scale  |
| ----- | ------ |
| 60px  | `0.90` |
| 100px | `0.94` |
| 150px | `0.96` |
| 200px | `0.97` |
| 300px | `0.98` |

Three limits on the rule:

- **Floor the scale around `0.90`.** For an element whose center is very close to
  its origin, the formula demands an aggressive scale to manufacture 6px — at
  `d = 30px` it asks for `0.80`, which reads as a zoom, not an emergence. Accept
  less travel rather than a scale that draws attention to itself.
- **Travel is measured at the element's center, by convention.** Scaling about a
  point moves every other point in proportion to _its own_ distance from that
  origin, so the far edge always travels further than the center and the near edge
  barely moves. Keep the center as the yardstick so numbers stay comparable.
- **Content-driven height makes this an estimate.** A popover's width comes from
  its `size` variant but its height comes from whatever is inside it, so `d` is
  only known at runtime. Pick the scale for the typical height of that surface and
  accept the spread; a component whose height genuinely varies by multiples wants
  a scale per size variant, not one constant.

## Reduced motion

Gate the **moving property**, not the duration — the signal is about vestibular
safety, so the fade should survive: `transitionProperty` drops to `'opacity'`
under `@media (prefers-reduced-motion: reduce)`.

With a positional duration list, the collapsed single-property list takes the
first value — check that it's the one you want for opacity.

### That alone is not enough — also drop the value

Removing `transform` from `transitionProperty` stops it _animating_; it does not
stop it _changing_. The `data-starting-style` / `data-ending-style` branch still
applies `scale(0.94)`, now instantly. Entering that is invisible (it happens at
`opacity: 0`), so this reads as correct in review and in a diff — but **exiting**,
the element snaps to 94% at full opacity and then fades. The reported symptom is
"reduced motion still animates, but only on the way out."

Restate the state branch **inside** the media query. Note the nesting direction:
StyleX only accepts at-rule outer / pseudo inner, so `:where(...)` containing an
`@media` key fails `@stylexjs/valid-styles` ("Invalid Pseudo class or At Rule used
for conditional style value").

```ts
transform: {
  default: 'scale(1)',
  ':where([data-starting-style], [data-ending-style])': 'scale(0.94)',
  '@media (prefers-reduced-motion: reduce)': {
    default: 'scale(1)',
    ':where([data-starting-style], [data-ending-style])': 'scale(1)',
  },
},
```

A bare sibling `@media` key ties on specificity, so `@stylexjs/sort-keys` can
reorder it out of winning. The nested form gets a third class and wins outright.

Verify all four combinations — enter and exit, reduced and normal. Under reduced
motion both directions should hold the scale flat at `1.0000` for every frame.

## How to check a transition

Reading CSS will not tell you a transition stalls. Two cheap techniques:

**Score the curve offline** before writing it — sample `cubic-bezier` at 16.7ms
intervals across the duration, convert to the property's real values, and count
frames whose step is below ~0.003 of the total delta.

**Record the real thing** with a rAF sampler (see `stylex.md` for the
`data-*` attributes that drive enter/exit):

```js
const t0 = performance.now(),
  rows = [];
(function tick() {
  const e = document.querySelector('.cl-popover-popup');
  if (!e) return console.table(rows);
  const cs = getComputedStyle(e);
  rows.push({
    ms: +(performance.now() - t0).toFixed(1),
    scale: +new DOMMatrix(cs.transform).a.toFixed(4),
    opacity: +(+cs.opacity).toFixed(3),
  });
  requestAnimationFrame(tick);
})();
```

Gotchas when driving this from a browser-automation CLI: a round-trip outlasts a
150ms transition, so slow it with a `transition-duration` override or pause via
`getAnimations()` and set `currentTime`; pausing at `currentTime = 0` also freezes
opacity at 0, so hold the opacity animation at its end if you want a visible
frame; and light dismiss listens on pointerdown, so a synthetic `.click()` will
not close a popover — send a real key instead.
