# Motion: entrances and exits

Token semantics live in `packages/ui/src/mosaic/tokens.stylex.ts`, above
`durationDefaults` / `easingDefaults` — read those comments first. This file is the
how-to layer: the rules that decide a transition's shape, and how to check one
rather than eyeball it.

| Token                   | Value                                   | For                         |
| ----------------------- | --------------------------------------- | --------------------------- |
| `--cl-duration-instant` | `0s`                                    | press feedback              |
| `--cl-duration-fast`    | `0.1s`                                  | exits, hover                |
| `--cl-duration-base`    | `0.15s`                                 | entrances                   |
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
