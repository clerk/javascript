# The public override contract

This is the crux of the pivot: consumers customize Mosaic **from their own CSS**,
not from an `appearance` prop. Three stable hooks, one delivery mechanism.

## The three stable hooks

| Hook               | Emitted by                   | Consumer targets                           |
| ------------------ | ---------------------------- | ------------------------------------------ |
| `--cl-*` vars      | `defineVars` (verbatim keys) | `:root { --cl-primary: … }`                |
| `.cl-<slot>` class | your stable-class helper     | `.cl-button { … }`                         |
| `data-*` attrs     | your `themeProps` helper     | `.cl-button[data-variant='outline'] { … }` |

**Never expose the atomic `x…` hashes.** They change every build. Only `--cl-*`,
`.cl-*`, and `data-*` are the API.

## Why a hand-attached stable class (and why it's safe)

StyleX will **not** hand you a stable atomic class — atomic classes are hashed and
per-property. So you attach your own plain class (`cl-button`) alongside StyleX's
classes as a targeting hook.

StyleX's maintainer calls mixing a non-StyleX class with atomic classes for
_styling_ "unpredictable" ([discussion #442](https://github.com/facebook/stylex/discussions/442)) —
**but that caveat assumes no cascade layers.** Cascade layers make the outcome
deterministic: we ship our styles inside a layer the consumer controls, and their
overrides sit in a **later** layer, so their rule always wins by layer order. That
converts "unpredictable" into "reliable." (For non-styling markers — analytics,
session-replay masking — the merge is uncontroversial regardless.)

## Delivery: a static sheet imported into a consumer-owned layer

We ship one `mosaic.css`. The consumer imports it into a cascade layer they
control and overrides from a later layer:

```css
@layer components, overrides;
@import '@clerk/ui/mosaic.css' layer(components);

@layer overrides {
  :root {
    --cl-primary: rebeccapurple;
  } /* token override */
  .cl-button {
    border-radius: 9999px;
  } /* stable-class override */
  .cl-button[data-variant='outline'] {
    color: rebeccapurple;
  } /* variant scope */
}
```

`overrides` outranks `components` by layer order, so the consumer always wins. An
unlayered consumer rule wins too (unlayered outranks any layer). We keep StyleX's
`useCSSLayers: true`: its internal `@layer priorityN` handles intra-StyleX
precedence and **nests cleanly under whatever layer the consumer imports into** —
we do not engineer consumer precedence ourselves; placing our sheet in a layer is
the consumer's job.

> Document `@import … layer(components)` as the expected usage. If a consumer
> imports the sheet with **no** layer wrapper, our rules live in low-priority
> `priorityN` layers and become weak against the consumer's unlayered global CSS
> (a bare `button {}` reset could clobber us). The `layer(components)` form is the
> supported path.

## Emitting the hooks: `themeProps` + `mergeProps`

Two small helpers (adapted from astryx's `naming.ts` + `themeProps.ts` +
`mergeProps.ts`) centralize the contract. Put them in a shared module so the `cl`
prefix lives in exactly one place.

```ts
// naming.ts — single source of truth for the public namespace
export const NAMESPACE = 'cl';
export const stableClassName = (component: string) => `${NAMESPACE}-${component}`; // 'cl-button'
export const dataAttr = (name: string) => `data-${name}` as const;
```

```ts
// themeProps.ts — stable class + data-attribute reflection
export function themeProps(component: string, props?: Record<string, string | number | null | undefined>) {
  const classes = [stableClassName(component)];
  const attrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null) continue;
    // class token: CSS classes can't start with a digit — prefix with the prop name
    classes.push(/^\d/.test(String(v)) ? `${k}-${v}` : String(v));
    attrs[`data-${k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`] = String(v);
  }
  return { className: classes.join(' '), ...attrs };
}
// themeProps('button', { variant: 'outline', size: 'sm' })
// → { className: 'cl-button outline sm', 'data-variant': 'outline', 'data-size': 'sm' }
```

```ts
// mergeProps.ts — fuse themeProps + stylex.props() + consumer className/style
export function mergeProps(...parts: Array<Record<string, unknown> | string | undefined>) {
  const out: Record<string, unknown> = {};
  const classes: string[] = [];
  let style: React.CSSProperties | undefined;
  for (const p of parts) {
    if (p == null) continue;
    if (typeof p === 'string') {
      classes.push(p);
      continue;
    }
    const { className, style: s, ...rest } = p as { className?: string; style?: React.CSSProperties };
    Object.assign(out, rest);
    if (className) classes.push(className);
    if (s) style = { ...style, ...s }; // later wins → consumer style overrides
  }
  if (classes.length) out.className = classes.join(' ');
  if (style) out.style = style;
  return out;
}
```

Used on the public element (order matters — stable class + data-attrs first,
StyleX atoms next, consumer `className`/`style` last so they win):

```tsx
<button
  {...mergeProps(
    themeProps('button', { variant, size }),
    stylex.props(styles.base, variants[variant], sizeStyles[size]),
    className,
    style,
  )}
/>
// → class="cl-button outline sm x3nfvp2 x6s0dn4 …" data-variant="outline" data-size="sm"
```

The simpler POC `cx(stable, className, ...styles)` helper (in
`packages/ui/src/mosaic-x/props.ts`) is a subset of this — it emits only the
stable class, not the `data-*` reflection. Prefer the `themeProps`/`mergeProps`
pair once variant targeting matters.

## Consumers also lose these (accept the trade)

- **No `appearance.elements` JS-object overrides** and **no per-flow `scope`
  cascade** — those move to CSS selectors the consumer writes.
- **No arbitrary runtime `sx`** — overrides are CSS, or a token, or a precompiled
  variant. See `migration.md`.

## Caveat: consumer-side StyleX

If a consumer app _also_ uses StyleX, our precompiled atomic classes and theirs
won't dedupe across the package boundary (two separate StyleX outputs). With
layers this is harmless — no visual bug, just slightly larger CSS. Document it.
