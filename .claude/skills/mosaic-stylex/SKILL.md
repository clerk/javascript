---
name: mosaic-stylex
description: >-
  Author and organize StyleX styles for Mosaic components. Use when writing a
  component's styles with `stylex.create` / `stylex.props`, defining or consuming
  design tokens (`defineVars` / `defineConsts` / `createTheme`), exposing the
  stable public styling contract (stable `.cl-*` classes, `--cl-*` CSS variables,
  `data-*` attributes, cascade layers), setting up relational/state styling
  (markers + `stylex.when`), wiring the build (rollup/tsdown plugin, layers,
  ESLint), or migrating a Mosaic component off Emotion/`useRecipe` onto StyleX.
  The direction: compile-time atomic CSS, a shipped static stylesheet, and
  consumer overrides through their own CSS instead of the `appearance` prop.
---

# StyleX for Mosaic

Mosaic is pivoting its styling engine from **Emotion** (runtime CSS-in-JS,
`useRecipe`/`appearance`) to **StyleX** (compile-time atomic CSS, a shipped
static stylesheet). This skill is the how-to for authoring StyleX the Mosaic
way. It is grounded in two sources:

- The **astryx** design system (`../research/astryx`, ~350 `.stylex.ts` files) —
  a mature, production StyleX design system. Its patterns are the reference.
- The Clerk **mosaic-x POC** (`packages/ui/src/mosaic-x/`, PR #9189) and its
  writeup `references/mosaic-stylex-migration.md` — the proven direction for
  _this_ repo.

## The contract we are building toward

Four public-surface goals drive every decision. Consumers style Mosaic from
**their own CSS**, never from an `appearance` prop:

1. **Stable CSS variables** — `--cl-foreground`, `--cl-primary`, … default in
   our sheet and a consumer overrides them with plain `:root { --cl-foreground: red }`.
2. **Stable class names** — every button carries `.cl-button`; a consumer targets
   `.cl-button { … }` in their CSS.
3. **Stable data attributes** — variant/state reflected as `data-variant`,
   `data-size`, etc. for scoped targeting (`.cl-button[data-variant='outline']`).
4. **A shipped static stylesheet** (`mosaic.css`) imported once into a cascade
   layer the consumer controls.

StyleX gives us goals 1, 3, 4 natively. Goal 2 (stable classes) needs a specific
technique — you attach your own plain `.cl-*` class alongside StyleX's atomic
classes. See `references/overrides.md`.

## The core authoring shape

Every styled part follows the same three moves. Read this, then the references.

```tsx
import * as stylex from '@stylexjs/stylex';
import { mergeProps, themeProps } from '../shared/naming'; // cl-* stable class + data-attr helpers
import { colors, radius, space } from './tokens.stylex';

// 1. stylex.create — base + each variant VALUE as its own style object.
//    Variants are COMPOSED conditionally, not resolved by a recipe engine.
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    borderRadius: radius['--cl-radius-md'],
    // states live inside property values as { default, ':hover', … } — never as top-level keys
    outline: { default: 'none', ':focus-visible': `2px solid ${colors['--cl-primary']}` },
  },
  filledPrimary: { backgroundColor: colors['--cl-primary'], color: colors['--cl-primary-foreground'] },
  outline: { backgroundColor: 'transparent', borderColor: colors['--cl-border'] },
  sizeSm: { paddingBlock: space['--cl-spacing'], fontSize: '0.75rem' },
  disabled: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
});

// 2. Infer props; provide variant defaults.
export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
}

// 3. Compose in stylex.props(...); merge the stable class + data-attrs first,
//    consumer className/style last (they win).
export const Button = ({ variant = 'filled', size = 'md', disabled, className, style, ...rest }: ButtonProps) => (
  <button
    disabled={disabled}
    {...mergeProps(
      themeProps('button', { variant, size }), // → .cl-button + data-variant + data-size
      stylex.props(
        styles.base,
        variant === 'filled' && styles.filledPrimary,
        variant === 'outline' && styles.outline,
        size === 'sm' && styles.sizeSm,
        disabled && styles.disabled,
      ),
      className,
      style,
    )}
    {...rest}
  />
);
```

Three ideas make this different from the Emotion/`useRecipe` model you may know:

- **Variants are conditional composition, not a recipe engine.** There is no
  `defineSlotRecipe`, no `variants` map resolved at runtime, no `compoundVariants`
  DSL. You write `cond && styles.x` in `stylex.props(...)`. Last wins.
- **State is `{ default, ':hover', … }` inside a property value**, compiled into
  the sheet — not a `_hover` condition key resolved at runtime. (Consumers still
  override state through their own `.cl-*` CSS.)
- **The stable `.cl-*` class + `data-*` attrs are the public API**, emitted by
  `themeProps` and fused with StyleX's atomic classes by `mergeProps`. Consumers
  never see the atomic `x…` hashes.

## Which reference to read

| You are…                                                                          | Read                                   |
| --------------------------------------------------------------------------------- | -------------------------------------- |
| Writing a component's styles (create/props, variants, states, composition)        | `references/authoring.md`              |
| Defining or consuming tokens (`--cl-*` vars, `defineVars`/`defineConsts`, themes) | `references/tokens-and-theming.md`     |
| Exposing/overriding the public contract (stable classes, cascade layers)          | `references/overrides.md`              |
| Naming files, splitting styles, exports, the `naming`/`mergeProps` helpers        | `references/organization.md`           |
| Parent/sibling/state scoping (markers + `stylex.when`), dynamic, keyframes        | `references/relational-and-dynamic.md` |
| Setting up the build, ESLint, and distribution                                    | `references/build.md`                  |
| Migrating a component off Emotion/`useRecipe`                                     | `references/migration.md`              |

## Hard rules (apply everywhere)

- **Reference tokens, never hardcode** colors, spacing, radius, or type. `colors['--cl-foreground']`, not `'#000'`. Hardcoding breaks theming.
- **No top-level pseudo-classes or media queries.** Nest them inside property values: `{ default, ':hover', '@media …' }`.
- **No `style` or `className` alongside a raw `stylex.props()` spread on the same element** — route both through `mergeProps` so they merge correctly.
- **`defineVars`/`defineConsts` live only in `*.stylex.ts` files**, named exports only, no other exports in the file.
- **Longhand over shorthand** (`paddingBlock`/`paddingInline`, not `padding`); `null` unsets a property.
- **StyleX styles the element they're on — no child/descendant selectors.** Style each part on its own element; drive cross-element state by composing style objects or using markers (`references/relational-and-dynamic.md`).
- **Never document or let consumers target the atomic `x…` hashes** — they change every build. The stable surface is `.cl-*`, `--cl-*`, and `data-*` only.
