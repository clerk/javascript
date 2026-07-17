# Relational styling, dynamic styles, keyframes

Covers the harder-than-a-single-element cases: styling based on an ancestor/
sibling's state (markers), runtime values (dynamic styles), and animations.

## The no-child-selector constraint (read first)

StyleX styles **only the element the namespace is applied to**. There is no
`& > div`, no descendant selector, and no self attribute-selector like
`&[data-selected]`. This is the single biggest shift from Emotion Mosaic, where
recipes occasionally styled a child or keyed off `&[data-cl-selected]`.

Restructure using one of three moves:

1. **Style each part on its own element**, composing that part's style object from
   props passed down. A parent that "styled a child on selection" becomes: the
   parent computes `selected` and the child applies `selected && styles.selected`.
2. **Drive state as a composed variant** — `isSelected && styles.selected` in the
   child's `stylex.props(...)`, not a `&[data-selected]` selector.
3. **Use a marker** when the relationship is a genuine ancestor/sibling DOM state
   that can't be threaded as a prop (see below).

## Markers + `stylex.when` — scoped ancestor/sibling state

Markers solve: "style this element when an **ancestor** (or sibling) is in some
state, without that state leaking to unrelated descendants." Example: a radio
row's `:hover` shading should apply to that row only, not every descendant.

Define the marker in a `*.markers.stylex.ts` file, named `<component>Scope`:

```ts
// radio.markers.stylex.ts
import * as stylex from '@stylexjs/stylex';
export const radioScope: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker();
```

Reference it inside a property value with `stylex.when.ancestor(selector, scope)`:

```tsx
// RadioListItem.tsx
const styles = stylex.create({
  radioUnchecked: {
    borderColor: {
      default: colors['--cl-border'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colors['--cl-border']}, ${colors['--cl-foreground']} 20%)`,
      },
    },
  },
});
```

Place the marker on the ancestor whose state you're observing:

```tsx
<li {...stylex.props(styles.container, !isDisabled && radioScope)}>
  <span {...stylex.props(styles.radioUnchecked)} />
</li>
```

The available relational selectors:

| Function                                 | Observes                        |
| ---------------------------------------- | ------------------------------- |
| `stylex.when.ancestor(sel, scope?)`      | a marked ancestor matches `sel` |
| `stylex.when.descendant(sel, scope?)`    | a marked descendant matches     |
| `stylex.when.anySibling(sel, scope?)`    | any marked sibling matches      |
| `stylex.when.siblingBefore(sel, scope?)` | a preceding marked sibling      |
| `stylex.when.siblingAfter(sel, scope?)`  | a following marked sibling      |

- `stylex.defineMarker()` creates a custom scope (isolates the relationship to a
  specific element). `stylex.defaultMarker()` marks the element with the default
  scope for simple cases.
- Selectors can be compound: `stylex.when.ancestor(':has(:focus-visible)', switchScope)`
  is how astryx scopes a focus ring to a switch's own track.

**When to use a marker vs. plain nesting:** reach for a marker only when a
parent/sibling DOM state must reach a specific element and can't be a prop. If the
state is local to the element (its own `:hover`/`:focus`), use plain value-nested
pseudo-classes (`authoring.md`) — markers are heavier machinery.

Naming: file `<component>.markers.stylex.ts`; export `<component>Scope`. The
markers file often also exports the component's container/base styles.

## Dynamic styles — runtime values

For a value only known at runtime, use an arrow-function namespace. The body must
be a **plain object literal** — no logic, no destructuring, one or more params in,
object out.

```tsx
const dynamic = stylex.create({
  width: (w: number | string) => ({ width: w }),
  offset: (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` }),
  maxHeight: (h: string) => ({ '--cl-container-max-height': h }), // set a var dynamically
});

stylex.props(width != null && dynamic.width(width), xstyle);
```

Keep dynamic styles rare — they're an escape hatch, not the variant mechanism.
Anything expressible as a token or a precompiled variant should be.

## Keyframes & animation

Declare with `stylex.keyframes`, then reference the returned name in a style. Gate
motion behind `prefers-reduced-motion`:

```tsx
const spin = stylex.keyframes({ '0%': { transform: 'rotate(0)' }, '100%': { transform: 'rotate(360deg)' } });

const styles = stylex.create({
  spinner: {
    animationName: { default: spin, '@media (prefers-reduced-motion: reduce)': 'none' },
    animationDuration: motion['--cl-duration-slow'],
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
```

Use token variables for durations/easings, never hardcoded ms. For a set of
entrance animations, put them in a dedicated `<name>Animations.stylex.ts` and
share an `animationBase` object spread into each namespace (astryx's
`layerAnimations.stylex.ts` pattern).

## Fallbacks

`stylex.firstThatWorks(...)` picks the first value the browser supports:

```tsx
const styles = stylex.create({
  header: { position: stylex.firstThatWorks('sticky', '-webkit-sticky', 'fixed') },
});
```

astryx prefers conditional media-query disabling over `firstThatWorks` in
practice; use it when you genuinely need a progressive-enhancement fallback chain.
