# Motion: entrances and exits

Token semantics live in `packages/ui/src/mosaic/tokens.stylex.ts`, above
`durationDefaults` / `easingDefaults` — read those comments first. This file is the
how-to layer: the rules that decide a transition's shape, and how to check one
rather than eyeball it.

| Token                   | Value                                   | For                         |
| ----------------------- | --------------------------------------- | --------------------------- |
| `--cl-duration-instant` | `0s`                                    | hover and press arrival     |
| `--cl-duration-fast`    | `0.1s`                                  | exits                       |
| `--cl-duration-base`    | `0.15s`                                 | entrances, hover exit       |
| `--cl-duration-slow`    | `0.25s`                                 | larger surfaces             |
| `--cl-duration-slower`  | `0.35s`                                 | —                           |
| `--cl-ease-default`     | `cubic-bezier(0.175, 0.885, 0.32, 1.1)` | things ARRIVING (Swift Out) |
| `--cl-ease-exit`        | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` | things LEAVING (In Quad)    |

Named curves come from [easing.dev](https://www.easing.dev) (Lochie Axon's Easing
Graphs). Take one from there rather than inventing a bezier, so the catalog stays
the shared vocabulary.

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

Use `--cl-ease-exit` on `:where([data-ending-style])`. Same properties, opposite
direction, so both duration and timing function branch:

```ts
transitionDuration: {
  default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
  ':where([data-ending-style])': durationVars['--cl-duration-fast'],
},
transitionTimingFunction: {
  default: `linear, ${easingVars['--cl-ease-default']}`,
  ':where([data-ending-style])': `linear, ${easingVars['--cl-ease-exit']}`,
},
```

Both lists are **positional against `transitionProperty`** (`opacity, transform`).

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

## Color and state changes (hover, press)

A state change that only recolors — background, border, text, opacity — takes
**`linear`, always**. Nothing moves, so there is nothing for an ease to sell:
color interpolation is already perceptually non-uniform, an ease on top just drags
the midpoint, and `--cl-ease-default`'s overshoot would extrapolate past the target
color. Reserve the curves for geometry.

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
state — no doubled values, no JS:

```ts
transitionProperty: 'background-color, border-color, color, opacity',
transitionTimingFunction: 'linear',
transitionDuration: {
  default: durationVars['--cl-duration-base'], // 0.15s — leaving hover or press
  ':enabled:active': durationVars['--cl-duration-instant'],
  ':enabled:hover': durationVars['--cl-duration-instant'],
},
```

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
durations are `0s`.

### Children need the timing handed to them

**Transitions do not inherit.** A child that recolors along with its container — a
`Button`'s `Icon`, anything reading a `--_cl-*` color the parent branches per state —
animates on _its own_ `transition-duration`, not the parent's. Give the parent one
timing and the child another and the child visibly trails it; at `0s` in, a child
still on `0.1s` reads as the icon lagging the button by a tenth of a second.

Hand the duration down the same way the color goes down, so one declaration governs
both and they cannot drift apart:

```ts
// container: alongside `--_cl-icon-color`, on the same conditions
'--_cl-icon-duration': { default: base, ':enabled:active': instant, ':enabled:hover': instant },

// child: read it, defaulting to instant
transitionDuration: `var(--_cl-icon-duration, ${durationVars['--cl-duration-instant']})`,
```

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

Draw the thing permanently and animate the color instead:

```ts
textDecorationColor: { default: 'transparent', ':enabled:hover': 'currentColor' },
textDecorationLine: 'underline',
// and add `text-decoration-color` to the shared `transitionProperty`
```

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

An isolated button never fails this visibly, but the arrival is the same rule either
way; there is no button-versus-row split on the way in.

The same arithmetic sizes the comet trail: a 0.15s exit is a longer fade than the
0.1s modelled above, so it strings out proportionally more rows behind the pointer.
That is why the exit collapses to `0s` here even though it stays at 0.15s on a
button.

`Item` declares no `transition` at all, which is `0s` in both directions and is
correct on both counts — instant arrival, and no exit to trail the pointer. Leave it
that way; do not "improve" it by porting a button's 0.15s exit onto rows.

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
`packages/headless/src/utils/css-vars.ts` emits two origins on the floating
element; custom properties inherit, so a popup one level down reads them directly.

| var                     | meaning                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `--cl-transform-origin` | nearest **edge**, cross axis tracking the anchor (arrow-aware) |
| `--cl-anchor-origin`    | the anchor's bounding-box **center**, both axes                |

```ts
transformOrigin: 'var(--cl-anchor-origin, center)',
```

**Do not redefine `--cl-transform-origin`** — Menu branches consume it with the
edge semantics. Add a var instead.

Why a var and not a keyword: keyword origins (`top left`) anchor to the element's
own box, so they drift off the trigger the moment `shift()` or `flip()` moves it.
These are recomputed per position update and stay correct.

**Timing is safe.** On a cold mount the var is unset for the mutation frame — but
the element is `opacity: 0` with `transition: none` then. Both the position and
the var settle by rAF 1; the transition arms at rAF 2. Origin is always correct
before anything animates.

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

Two effects push the same way, which is convenient: the absolute size change is
`(1 − s) ×` the element's own dimensions, so a big surface at a fixed scale is
already shrinking by more px than a small one. Scaling toward 1 as things grow
fixes both at once.

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
safety, so the fade should survive:

```ts
transitionProperty: {
  default: 'opacity, transform',
  '@media (prefers-reduced-motion: reduce)': 'opacity',
},
```

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

A bare sibling `'@media (prefers-reduced-motion: reduce)': 'scale(1)'` also works
today, but it compiles to `(0,2,0)` — the same as the branch it needs to beat — so
the tiebreak is source order, which `@stylexjs/sort-keys` reorders on autofix.
Repeating the selector inside the at-rule earns a third class and wins outright:

```css
.a.a:where([data-starting-style], [data-ending-style]) {
  transform: scale(0.94);
} /* 0,2,0 */
@media (prefers-reduced-motion: reduce) {
  .b.b.b:where([data-starting-style], [data-ending-style]) {
    transform: scale(1);
  } /* 0,3,0 */
}
```

Verify all four combinations — enter and exit, reduced and normal. Under reduced
motion both directions should hold the scale flat at `1.0000` for every frame.

## How to check a transition

Reading CSS will not tell you a transition stalls. Two cheap techniques:

**Score the curve offline** before writing it — sample `cubic-bezier` at 16.7ms
intervals across the duration, convert to the property's real values, and count
frames whose step is below ~0.003 of the total delta.

**Record the real thing** with a rAF sampler (see `references/stylex.md` for the
`data-*` attributes that drive enter/exit):

```js
const el = document.querySelector('.cl-popover-popup');
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
