# Mosaic Design System Architecture

## Overview

Mosaic is the next-generation design system for Clerk's UI components, replacing the existing styled system. Both systems coexist during migration — Mosaic lives under `packages/ui/src/mosaic/` as a self-contained module that doesn't touch any existing code.

Mosaic uses Emotion for CSS-in-JS but delivers theme tokens via its own React context (not Emotion's `ThemeProvider`). This avoids type conflicts with the existing system's `InternalTheme` augmentation on Emotion's global `Theme` interface.

Once migration is complete, the old system is removed and Mosaic becomes the sole design system.

## Token architecture

### MosaicTheme

The token type is derived from the default values — not a hand-written interface:

```ts
// packages/ui/src/mosaic/variables.ts
export const defaultMosaicVariables = Object.freeze({
  color: { primary: '...', primaryForeground: '...', ... },
  spacing: '0.25rem',
  radius: { xs: '0.125rem', sm: '0.25rem', md: '0.375rem', ... },
  fontSize: { xs: { size: '0.75rem', lineHeight: '...' }, ... },
} as const);

export type MosaicTokens = typeof defaultMosaicVariables;
```

### MosaicTheme helpers

`MosaicTheme` includes computed helpers alongside static tokens:

```ts
const theme = useMosaicTheme();

// spacing(n) — multiply base spacing by n
theme.spacing(2); // "calc(0.25rem * 2)"

// alpha(color, opacity) — apply opacity via color-mix
theme.alpha('primary', 80); // "color-mix(in oklab, <primary-value> 80%, transparent)"

// mix(colorA, colorB, percentage) — blend colors via color-mix
theme.mix('primary', 'primaryForeground', 50); // "color-mix(in oklab, <primary>, <primaryForeground> 50%)"

// text(key) — typography scale with fontSize + lineHeight
theme.text('sm'); // { fontSize: '0.875rem', lineHeight: '...' }
```

## Theme delivery

### MosaicProvider

Single provider that handles cascade and theme delivery:

```tsx
import { MosaicProvider } from '../mosaic/MosaicProvider';

<MosaicProvider>{children}</MosaicProvider>;
```

### useMosaicTheme

Hook to access the resolved theme:

```tsx
import { useMosaicTheme } from '../mosaic/MosaicProvider';

function MyComponent() {
  const theme = useMosaicTheme();
  return <div css={{ color: theme.color.primary, padding: theme.spacing(4) }} />;
}
```

### Why React context instead of Emotion's ThemeProvider

Emotion's `ThemeProvider` is typed to the global `Theme` interface, which is augmented to `InternalTheme` in `emotion.d.ts`. Passing a `MosaicTheme` to it would be a type error. A plain React context avoids this entirely.

What we lose:

1. **Theme merging on nesting** — nested `MosaicProvider`s replace rather than merge. Implement merge logic in `MosaicProvider` if needed.
2. **`css={(t) => ...}` function form** — Emotion would type `t` as `InternalTheme`. Use `useMosaicTheme()` instead.
3. **`useTheme()` from `@emotion/react`** — use `useMosaicTheme()` instead.

What we keep: `css` prop (with plain objects), `keyframes`, `Global`, style serialization, deduplication, SSR.

## Cascade

Appearance overrides merge lowest-to-highest priority:

1. Default tokens (`defaultMosaicVariables`)
2. Base theme overrides (prebuilt themes)
3. Global appearance overrides
4. Component-level appearance overrides

`MosaicProvider` accepts `variables` and resolves them via `resolveVariables`.

## CVA utility

`packages/ui/src/mosaic/cva.ts` — a CVA-style variant utility returning Emotion style objects.

### Static config (no theme)

```ts
import { cva } from '../mosaic/cva';

const styles = cva({
  base: { display: 'flex', fontWeight: 600 },
  variants: {
    intent: {
      primary: { background: 'blue', color: 'white' },
      secondary: { background: 'white', border: '1px solid gray' },
    },
    size: {
      sm: { fontSize: 12, padding: '4px 8px' },
      md: { fontSize: 16, padding: '8px 16px' },
    },
    disabled: {
      false: null,
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  },
  compoundVariants: [{ intent: 'primary', disabled: false, css: { '&:hover': { background: 'darkblue' } } }],
  defaultVariants: { intent: 'primary', size: 'md', disabled: false },
});
```

### Theme-aware config

```ts
const styles = cva(theme => ({
  base: { borderRadius: theme.radius.md },
  variants: {
    intent: {
      primary: { background: theme.color.primary, color: theme.color.primary },
      outline: { background: 'transparent', border: `1px solid ${theme.color.border}` },
    },
  },
}));
```

### Usage

```ts
// Returns (theme: MosaicTheme) => StyleRule
styles({ intent: 'primary', size: 'sm' });
styles({ disabled: true }); // boolean, not string 'true'
styles(); // uses defaultVariants
```

### VariantProps type helper

```ts
import { cva, type VariantProps } from '../mosaic/cva';

const styles = cva({ ... });
type ButtonVariantProps = VariantProps<typeof styles>;
// { intent?: 'primary' | 'outline'; size?: 'sm' | 'md'; disabled?: boolean }
```

Boolean variants (`{ true: ..., false: ... }`) are automatically typed as `boolean` props via `UnwrapBooleanVariant`. At runtime, `true`/`false` are coerced to `'true'`/`'false'` for variant map lookup.

### Design decisions

- **No `filterProps`** — components destructure their own variant props
- **No props overload** — if it affects styles, it's a variant
- **Flat compound variants** — `{ size: 'sm', intent: 'primary', css: {...} }` (variant keys at top level, `css` for styles)
- **Two overloads** — static config or `(theme: MosaicTheme) => config`
- **`null` variant values** — no styles applied (e.g. `disabled: { false: null, true: {...} }`)

## Component authoring pattern

```tsx
import { cva, type VariantProps } from '../mosaic/cva';
import { useMosaicTheme } from '../mosaic/MosaicProvider';

// 1. Define variants
const styles = cva(theme => ({
  base: { borderRadius: theme.radius.md, fontFamily: 'inherit' },
  variants: {
    intent: {
      primary: { background: theme.color.primary, color: theme.color.primaryContrast },
      outline: { background: 'transparent', border: `1px solid ${theme.color.border}` },
    },
    size: {
      sm: { padding: `${theme.spacing.xs} ${theme.spacing.sm}` },
      md: { padding: `${theme.spacing.sm} ${theme.spacing.md}` },
    },
    disabled: {
      false: null,
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  },
  defaultVariants: { size: 'md', disabled: false },
}));

// 2. Extract variant props
type ButtonProps = React.ComponentPropsWithRef<'button'> & VariantProps<typeof styles>;

// 3. Destructure variants, resolve theme, pass plain object to css
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { intent, size, disabled, ...rest } = props;
  const theme = useMosaicTheme();
  return (
    <button
      ref={ref}
      {...rest}
      css={styles({ intent, size, disabled })(theme)}
    />
  );
});
```

## Coexistence with existing system

### Provider tree

```text
StyleCacheProvider (shared Emotion cache)
└── AppearanceProvider (existing)
    └── InternalThemeProvider (existing — Emotion ThemeProvider)
        └── MosaicProvider (new — plain React context)
            └── [mixed component tree]
                ├── ExistingComponent  → css={t => t.colors.$primary500}
                └── MosaicComponent    → css={styles({ intent: 'primary' })(theme)}
```

### Rules

- **Do not** pass `MosaicTheme` to Emotion's `ThemeProvider`
- **Do not** use `css={(t) => ...}` function form in Mosaic components (Emotion types `t` as `InternalTheme`)
- **Do** use `useMosaicTheme()` + plain style objects for all Mosaic components
- **Do** import from `src/mosaic/` directly (no barrel files)

### What shares

- Emotion cache (`cl-internal` key) — both systems inject into the same cache
- `@emotion/react`'s `css` prop — both systems use it (Mosaic with plain objects, existing with theme callbacks)
- `keyframes`, `Global` — available to both

### What doesn't share

- Theme type — `MosaicTheme` vs `InternalTheme` (completely independent)
- Theme delivery — React context vs Emotion's `ThemeProvider`
- Variant utility — `cva` vs `createVariants`

## Migration guide

To migrate a component from the old system to Mosaic:

1. Replace `createVariants` with `cva` — move from `(theme, props) => ({ base, variants })` to `theme => ({ base, variants })`. Variant props that were in the `props` parameter become proper variants.
2. Replace `applyVariants(props)` with `styles({ ...variantProps })(theme)` where `theme = useMosaicTheme()`.
3. Remove `filterProps` — destructure variant keys from props directly.
4. Update token references — e.g. `theme.colors.$primary500` → `theme.color.primary`.
5. Ensure the component is inside a `MosaicProvider` in the tree.

## Files

| File                               | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `src/mosaic/variables.ts`          | Token types, `MosaicVariables`, `resolveVariables`, defaults |
| `src/mosaic/MosaicProvider.tsx`    | Provider + `useMosaicTheme()` hook                           |
| `src/mosaic/cva.ts`                | CVA variant utility + `VariantProps` type                    |
| `src/mosaic/__tests__/cva.test.ts` | CVA test suite                                               |
