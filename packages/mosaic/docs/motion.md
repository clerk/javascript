# Motion

Read this when you add or change a transition, an entrance or exit, a hover or press color change, a row that expands and collapses, or reduced-motion handling. It covers which curve and duration a change takes, the geometry of an entrance, and how to check a transition frame by frame; the StyleX syntax for `data-*` state is in [StyleX](stylex.md#state-on-another-element), and loading shimmer is in [Skeletons](skeletons.md).

Worked examples: `src/components/popover/popover.styles.ts` (entrance and exit), `src/components/button/button.styles.ts` (color change on an isolated control), `src/components/item/item.styles.ts` (color change in a collection), `src/components/card/card.styles.ts` (`banner.collapse`, `clip`, `surface` for an expanding row).

The token meanings are in the comments above `durationDefaults` and `easingDefaults` in `src/tokens.stylex.ts`; read them first. Take a named curve from [easing.dev](https://www.easing.dev) rather than inventing a bezier.

## Rules

- An exit uses `--cl-ease-exit`, never the entrance curve run backwards.
- Exits are shorter than entrances: `--cl-duration-base` in, `--cl-duration-fast` out. Stay on the duration scale.
- On the way in, opacity takes the shorter duration so it lands opaque as the transform settles. On the way out, opacity and transform share one duration.
- Anything that animates out holds its last frame: `Freeze` around the children, or `useHeldMessage` (`src/utils/feedback.tsx`) for a message row ([Headless → Exiting content must be frozen](headless.md#exiting-content-must-be-frozen)).
- A color change on an element that stays put is `linear` and arrives in `0s`.
- A popup scales about its trigger through `--cl-transform-origin` or `--cl-anchor-origin`, never a keyword origin, and travels about 6px.
- Reduced motion drops the moving property from `transitionProperty` and also pins its value in the state branch. The fade stays.
- Sibling reflow uses `useLayoutAnimation` (`src/primitives/hooks/`; its JSDoc covers the wiring), with `--cl-layout-duration` and `--cl-layout-easing` set from tokens, not literals.
- Check a transition per frame, not by eye ([How to check a transition](#how-to-check-a-transition)).

## Choosing a curve

- **`--cl-ease-default` for a scale entrance.** It passes about 2% of the delta past its target. On a scale entrance that is under a pixel (0.4px on a 320px popover), so Menu, Select and Popover take it.
- **`--cl-ease-enter` for travel.** A sheet translating its own 640px height would overshoot by about 15px and visibly correct, so travel takes `--cl-ease-enter`, which decelerates the same way without passing. Dialog takes it too, as a house choice (`dialog.styles.ts`), and so does every entrance's opacity.
- **A curve has a direction.** Run backwards, an entrance curve does three things wrong on exit: 90% of the travel happens in the first three frames and the rest crawls (users call it choppy, with no dropped frames), the overshoot becomes a wobble, and the shape finishes long before the fade. Branch both `transitionDuration` and `transitionTimingFunction` on `:where([data-ending-style])` (`popover.styles.ts`). The entrance lists are positional against `transitionProperty` (`opacity, transform`).
- **A layout settle is not an exit.** `--cl-ease-exit` accelerates away and stops abruptly, which is hidden only because the content has faded. A row collapsing behind that content is still visible at the end, so it takes `--cl-ease-in-out`.
- **Small deltas constrain the curve.** A 0.06 scale over 100ms is six frames, and a back-loaded curve puts several below visible change. The exit curve is In Quad, the gentlest of the in-family. A longer duration makes this worse; if a curve stalls, shorten the duration or increase the delta.

## Entrance geometry

`cssVars` (`src/primitives/utils/css-vars.ts`) sets `--cl-transform-origin` (the nearest edge) and `--cl-anchor-origin` (the anchor's center) on the floating element. They inherit, so a nested popup reads them directly. A keyword origin drifts off the trigger when `shift()` or `flip()` moves the popup. Do not redefine `--cl-transform-origin`, because Menu reads it with the edge meaning; add a var instead.

Hold the travel near 6px, not the scale. Travel is `(1 − scale) × d`, where `d` is the distance from the origin to the element's center, so solve `scale = 1 − 6 / d`: `0.94` at 100px, `0.97` at 200px.

- Floor the scale around `0.90`. Close to the origin the formula asks for a zoom; accept less travel.
- A popup's height comes from its content, so pick the scale for the typical height. A component whose height varies by multiples wants a scale per size variant.
- A wide trigger with a much narrower `-start` or `-end` popup moves the origin off center. Matching the popup's width to the trigger fixes it.

## Expanding and collapsing a row

Reuse `card.styles.ts` (`Card.Banner`) for a row that opens around content. `Field.Message` and `Section.Error` share the measured-height variant in `src/styles/feedback.styles.ts` and `src/utils/feedback.tsx`. Do not rebuild either. The rules below are for changing them.

The content leads and the row follows: no hard clip edge is ever visible, and the row moves fast only while its content is invisible. Break either and one motion reads as two.

- **Enter.** The row opens on `--cl-ease-enter` at `slow`. The surface waits one `fast`, then fades in at `fast` on `--cl-ease-enter` and scales from `0.96` at `base` on `--cl-ease-default`, about the top edge.
- **Exit.** The surface leaves at once, at `fast` on `--cl-ease-exit`. The row collapses on `--cl-ease-in-out` at `slow` with no delay; its slow start holds the row near rest until the content is gone. Do not delay the collapse.
- **Inline text** with no box, such as a field error, takes the opacity timing and delay only, with no transform.
- The `slow` row duration was tuned on a 54px row. Treat it as soft guidance for other heights and check per frame.
- **Anchor the content to the moving edge** (`align-content: end`), so the clip line never crosses a hard bottom border.
- **The clip layer spans into the implicit second row.** An `fr` track resolves twice, so an item stretched to the track alone lags the wrapper's edge.
- Padding on the clip layer holds the `0fr` track open, so put the content's spacing on margins one level down.
- The wrapper cannot sit in a grid parent with a gap, since a closed row still costs the gap. Use a flex or gapless parent.
- The fade on the clipped edge is a static mask on the wrapper. `INSET` in `card.styles.ts` is both the mask length and the surface's top margin and must stay one constant. Do not animate `mask-size`. A hard line at the moving edge means the clip layer and wrapper heights differ; compare them per frame.

### The measured-height variant

`Field.Message` swaps one message for another while open, which `0fr ↔ 1fr` cannot animate, so it animates `height` from a measured var. Measure only when the content changes size while open; otherwise `0fr ↔ 1fr` covers open and closed.

- `useMessageHeight` returns `undefined` until the first measurement, and the var stays unset then, so an initially visible row does not grow from zero. Once measured, it keeps the last height while the content exits.
- A closed row must not cost the parent's gap: the wrapper cancels it and the message restores it as a margin (`GAP` in `feedback.styles.ts`). A parent with a different gap sets `--_cl-feedback-gap`.
- A swap plays out, then in, and the row eases between heights on `--cl-ease-enter`.

### Reduced motion for a row

The row takes `transition-property: none` and snaps. The surface keeps its fade and pins its scale, and its entrance delay goes to `instant`.

## Color and state changes

A change to an element that is already there and stays (background, border, text, a dimming opacity, a scrim) is `linear`. The arrival is `0s`, because any duration is latency after the user moved the pointer. The exit depends on whether the pointer sweeps across the element on its way elsewhere:

| The highlight sits on…                                               | In   | Out     |
| -------------------------------------------------------------------- | ---- | ------- |
| an isolated control: a button, a card, a standalone target           | `0s` | `0.15s` |
| a traversed collection: a menu item, list or table row, palette item | `0s` | `0s`    |

The axis is traversal, not element type: a toolbar button the pointer sweeps across follows the collection row. Any fade on a row leaves several rows lit behind a moving cursor, so do not port a button's exit onto rows. `item.styles.ts` declares no `transition` at all.

- **The mechanic.** The duration an element carries in a state governs the transition into that state, so one declaration per state gives the asymmetry (`transitionDuration` in `button.styles.ts`). Keep the duration outside `@media (hover: hover)`. The hover and press selectors follow [StyleX → Conditions and state](stylex.md#conditions-and-state).
- **Children need the timing handed to them.** Transitions do not inherit, so a child that recolors with its parent trails it. Pass the duration down like the color (`--_cl-icon-duration` in `button.styles.ts`, read in `icon.styles.ts`). The child defaults to `instant` and still declares `transitionProperty` and `transitionTimingFunction`.
- **A keyword cannot tween.** Draw `text-decoration-line` permanently and animate `text-decoration-color` (`button.styles.ts`). Do not animate `text-decoration-thickness` or `text-underline-offset`.

Not color changes: an element arriving on hover (a tooltip, a popover) is an entrance. A system-driven change (going disabled, a loading dim, a validation color) stays symmetric and on the duration scale. Color moving with geometry (a sliding thumb) takes the movement's duration.

## Reduced motion

Under `@media (prefers-reduced-motion: reduce)`, `transitionProperty` drops to `'opacity'`, so the fade survives. A positional duration list collapsed to one property takes the first value; check it is the one you want.

That alone is not enough. Dropping `transform` stops it animating, not changing, so on exit the element snaps to its state value at full opacity and then fades. Restate the state branch inside the media query:

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

The at-rule goes outside and the pseudo inside; the reverse fails `@stylexjs/valid-styles`. A sibling `@media` key at the top level ties on specificity, so `@stylexjs/sort-keys` can reorder it out of winning. Verify enter and exit under both settings.

## How to check a transition

Reading CSS will not tell you a transition stalls.

- **Score the curve offline** before writing it: sample the `cubic-bezier` at 16.7ms steps and count frames that move less than about 0.003 of the delta.
- **Record the real thing** with a rAF sampler:

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

From a browser-automation CLI, a round-trip outlasts a 150ms transition: slow it with a `transition-duration` override, or pause with `getAnimations()` and set `currentTime`. Pausing at `currentTime = 0` also freezes opacity at 0, so hold the opacity animation at its end. Light dismiss listens on `pointerdown`, so a synthetic `.click()` will not close a popover; send a real key.
