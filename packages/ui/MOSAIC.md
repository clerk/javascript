# Mosaic — Clerk UI Design System Exploration

Working document covering the Mosaic design system exploration: replacing Emotion CSS-in-JS with static CSS, evaluating styling approaches, composed API context, and component injection.

---

## Table of Contents

1. [Background](#background)
2. [Proposal: CSS Modules](#proposal-css-modules)
3. [Alternatives Evaluated](#alternatives-evaluated)
4. [Side-by-Side Comparison](#side-by-side-comparison)
5. [Design Tokens](#design-tokens)
6. [Component Pattern](#component-pattern)
7. [Build Pipeline](#build-pipeline)
8. [Customer Developer Flows](#customer-developer-flows)
9. [Agent-Driven Customization](#agent-driven-customization)
10. [Rollout Plan](#rollout-plan)
11. [Composed Profile API](#composed-profile-api)
12. [Component Injection](#component-injection)
13. [Speculative Changelog Post](#speculative-changelog-post)
14. [Impact on Other Parts of the Product](#impact-on-other-parts-of-the-product)

---

## Background

Clerk's UI components are styled using Emotion CSS-in-JS with a custom appearance cascade system. This system was designed for maximum customization flexibility — users can override design tokens, target 471 individual element keys (each with state and ID variants producing 1,000+ unique selectors), compose prebuilt themes, and pass CSS-in-JS objects through a JavaScript API.

That flexibility has come at a measurable cost:

**For Clerk developers (internal):**

- The theming infrastructure spans **53 source files and 6,437 lines of code** across `customizables/`, `styledSystem/`, `foundations/`, `themes/`, and theming-related utilities.
- Adding a single new styleable component requires touching **5 separate files**: the `APPEARANCE_KEYS` array (471 entries), the `ElementsConfig` type (554 lines of type declarations), the component file itself, the HOC wrapping chain in `customizables/index.ts`, and the JSX usage with `elementDescriptor`.
- Every component passes through **3 HOC wrappers** (`sanitizeDomProps` → `makeLocalizable` → `makeCustomizable`) before reaching the DOM. Each wrapper is a `React.forwardRef` component that adds a layer to the React tree and runs logic on every render.
- The variant system (`createVariants`, 141 lines) is a fully bespoke implementation that mirrors what CVA provides — it uses an `Infinity proxy` trick to extract variant keys at definition time and performs runtime theme evaluation on every render.
- The class generation pipeline (`classGeneration.ts`, 207 lines) runs a 7-step string-mutation sequence on every render of every wrapped component, performing up to 24 object property lookups for a component with 2 descriptors in a 3-layer cascade.
- A developer must hold **11 distinct concepts** simultaneously to confidently add and customize a new element: the APPEARANCE_KEYS registry, ElementsConfig type system, descriptor auto-generation, HOC chain, createVariants config shape, ThemableCssProp dual forms, cascade ordering, the `__` selector convention, the dual color-scale pipeline, CSS variable indirection patterns, and Emotion's css/className prop separation.

**For Clerk customers (external):**

- The `Variables` type exposes 22 properties, some of which accept two completely different input shapes (e.g., `fontSize` can be a string or a `FontSizeScale` object with 5 keys).
- The `Elements` type accepts 471 base element keys, each expandable with `__state` and `__id` suffixes, producing a keyspace of thousands. Finding the right key requires trial-and-error or consulting documentation — the keys are not discoverable from the component itself.
- Customization requires JavaScript — users pass CSS objects through a JS `appearance` prop. This means customization lives in JS config files, not in CSS where most developers expect styling to happen.
- The color system auto-generates 15 lightness shades and 15 alpha variants from a single input color, using a runtime pipeline that includes a browser capability check (`cssSupports.modernColor()`) and a 373-line legacy HSLA fallback path. Users have no control over which shades are generated.

**For AI agents (emerging consumer):**

- The `appearance` prop is a deeply nested JavaScript object. An agent needs to understand the cascade (global → per-component-key → per-component), the `__` selector convention, and which of the 1,000+ valid element keys to target.
- There is no machine-readable schema of available customization options. Agents must parse TypeScript type definitions or rely on documentation.
- The JS-based customization API requires agents to modify application code (JSX props or configuration objects), not just CSS files.

---

## Proposal: CSS Modules

Replace the Emotion-based appearance cascade with a new set of primitive components ("Mosaic") that use **CSS Modules** for styling and **CSS custom properties** for theming. The result: components ship as a static CSS file that users import once (`import '@clerk/ui/mosaic.css'`), customize with plain CSS variable overrides, and target with stable `data-cl-slot` attributes. No JavaScript styling API, no runtime style computation, no appearance cascade.

This eliminates the 6,400-line theming infrastructure, the 3-HOC wrapper chain, the 7-step class generation pipeline, and the runtime color scale computation. For customers, customization becomes "write CSS" — the most universal, stable, and agent-friendly interface available. For Clerk developers, adding a new component means writing a `.tsx` file and a `.module.css` file — two files, zero registries, zero HOCs.

### Key Decisions

| Decision            | Choice                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| CSS strategy        | CSS Modules (build-time scoped)                                         |
| Scope               | New primitives only: Button, Input, Select                              |
| Location            | `packages/ui/src/mosaic/`                                               |
| Token namespace     | `--clerk-*` CSS custom properties                                       |
| Token granularity   | Semantic only (`--clerk-color-primary-hover`, not numbered scales)      |
| Token scoping       | `:root`                                                                 |
| Dark mode           | `light-dark()` CSS function, controlled via `color-scheme` property     |
| Variants            | `data-*` attributes targeted by CSS attribute selectors                 |
| Component API       | `className` + `ref` forwarding (standard React primitives)              |
| Public selector API | `data-cl-slot` attributes (e.g., `data-cl-slot="button-root"`)          |
| CSS delivery        | Single `import '@clerk/ui/mosaic.css'`                                  |
| Class naming        | `generateScopedName` auto-prepends `cl-` (internal, not public API)     |
| Emotion coexistence | Separate `tsconfig.mosaic.json` with `jsxImportSource: "react"`         |
| User customization  | Pure CSS — override `--clerk-*` vars, target `[data-cl-slot]` selectors |

### Current vs. Mosaic: side-by-side

| Dimension                              | Current (Emotion)                                               | Mosaic (CSS Modules)                                                        |
| -------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Files to add a new component           | 5 (registry, type, component, HOC chain, JSX usage)             | 2 (component, CSS file)                                                     |
| HOC wrappers per component             | 3                                                               | 0                                                                           |
| Theming infrastructure (files / lines) | 53 / 6,437                                                      | ~5 / ~200 (tokens.css, build config, type declaration)                      |
| Concepts to learn                      | 11                                                              | 3 (CSS Modules imports, `data-*` variants, `--clerk-*` tokens)              |
| Runtime style computation              | Every render                                                    | None                                                                        |
| Customer customization API             | JS `appearance` prop (471 element keys, `Variables` object)     | CSS (override variables, target `data-cl-slot` selectors)                   |
| Dark mode                              | JS theme swap (`dark` theme object import)                      | CSS `color-scheme` property or `light-dark()`                               |
| Agent discoverability                  | Parse TypeScript types                                          | Read `CUSTOMIZATION.md` or inspect DOM (`data-cl-slot` visible in DevTools) |
| Modern CSS features                    | Requires library support                                        | Direct access (`@property`, `@layer`, `@scope`, `@container`, etc.)         |
| SSR / RSC                              | Requires Emotion SSR setup                                      | Works natively                                                              |
| Bundle impact                          | Emotion runtime (~12KB) + theme object + style computation code | Static CSS file (cacheable, no JS runtime)                                  |

### File Structure

```
packages/ui/src/mosaic/
├── tokens.css              # Design token CSS custom properties
├── Button.tsx              # Button component
├── Button.module.css       # Button styles
├── Input.tsx               # Input component
├── Input.module.css        # Input styles
├── Select.tsx              # Select component
├── Select.module.css       # Select styles
├── index.ts                # Public exports
└── scripts/
    └── generate-customization-docs.ts   # Parses mosaic.css → CUSTOMIZATION.md
```

---

## Alternatives Evaluated

### Pigment CSS (zero-runtime CSS-in-JS)

MUI's build-time CSS-in-JS extraction library. Offers colocated styles in JS (familiar to the team) and a built-in variant system, with build-time extraction to static CSS.

**What it offers:**

- Colocated styles in `.tsx` files (same DX as Emotion)
- Built-in `variants` array with prop matching
- Theme callbacks via `({ theme }) => ({})` — resolved at build time
- Dual distribution: pre-extracted CSS for default consumers, raw source for advanced users via `transformLibraries`
- `extendTheme({ cssVarPrefix: 'clerk' })` auto-generates `--clerk-*` CSS vars
- `colorSchemes` + `getSelector` for class-based dark mode (`.theme-light` / `.theme-dark`)

**Why we deferred it:**

- Pigment CSS is v0.0.31 (alpha) with no stability guarantees — a risky foundation for a design system
- Its JS object syntax cannot express modern CSS features like `@property`, `@layer`, `@scope`, or `@starting-style` without escape hatches
- The advanced customization path (consumer-side `transformLibraries` + plugin) adds significant setup friction
- CSS Modules achieve the same output (static CSS, zero runtime) with no new dependencies and full access to the CSS language

<details>
<summary>Pigment CSS component pattern (Button example)</summary>

```tsx
/** @jsxImportSource react */
import { styled } from '@pigment-css/react';

export const Button = styled('button', {
  name: 'ClerkButton',
  slot: 'root',
})<ButtonProps>(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.vars.spacing[2],
  borderRadius: theme.vars.radii.md,
  fontFamily: theme.vars.typography.fontSans,
  fontWeight: theme.vars.typography.fontWeightMedium,
  cursor: 'pointer',
  border: 'none',
  transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',

  '&:focus-visible': {
    outline: `2px solid ${theme.vars.colors.ring}`,
    outlineOffset: '2px',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: [
    {
      props: { variant: 'solid' },
      style: {
        background: theme.vars.colors.primary,
        color: theme.vars.colors.primaryContrast,
        '&:hover': { background: theme.vars.colors.primaryHover },
      },
    },
    {
      props: { variant: 'outline' },
      style: {
        background: 'transparent',
        color: theme.vars.colors.fg,
        border: `1px solid ${theme.vars.colors.border}`,
        '&:hover': { background: theme.vars.colors.surface },
      },
    },
  ],
}));
```

Build pipeline: separate Vite config (`vite.mosaic.config.ts`) with `@pigment-css/vite-plugin`. Dependencies: `@pigment-css/react` (runtime) + `@pigment-css/vite-plugin` (build).

</details>

### Tailwind CSS v4

Tailwind v4's shift to CSS-first configuration (`@theme` replaces `tailwind.config.js`) and native CSS custom property output made it worth serious consideration — especially since many Clerk consumers already use Tailwind.

**What it offers:**

- `@theme` directive defines tokens in CSS and automatically generates both CSS custom properties on `:root` and utility classes (`bg-clerk-primary`, `rounded-clerk-md`)
- `@reference` directive lets CSS files use `@apply` without re-emitting Tailwind's full output — viable for component library CSS
- Zero runtime — compiled output is static CSS, same as CSS Modules
- Consumer theme unification — Tailwind consumers could import Clerk's `@theme` tokens and use them in their own components

**Why we deferred it:**

- **Distribution is unsolved.** Pre-compiled Tailwind CSS has `@layer` conflicts when dropped into a consumer app that also uses Tailwind v4 (documented issue, GitHub #17954, #18758). The source-distribution path requires every consumer to have Tailwind installed. There is no path that "just works" for all consumers — CSS Modules has no such problem.
- **No `light-dark()` support.** Tailwind's dark mode uses class toggling (`.dark`) or media queries, not the `color-scheme` property. This means two separate variable blocks (light + dark) instead of one `light-dark()` declaration per token — doubling the token maintenance surface.
- **Modern CSS features are second-class.** `@property`, `@scope`, `@starting-style` etc. work in CSS files alongside Tailwind, but can't be expressed via utility classes. You'd fall back to plain CSS for these features, creating a split authoring model.
- **Agent parseability.** `[data-cl-slot='button-root']` and `--clerk-color-primary` are semantic and self-documenting. `inline-flex items-center justify-center gap-2 rounded-md font-medium` describes physical styles, not a semantic identifier. Agents can target the former directly; they'd need to reverse-engineer the latter.
- **The `@apply` escape hatch negates the point.** If you use `@apply` in CSS Module files to avoid utility class strings in JSX, Tailwind is functioning as a preprocessor over CSS Modules — you get Tailwind's build complexity without its primary benefit.

<details>
<summary>Tailwind v4 component pattern (Button example)</summary>

```tsx
// Option 1: Utility classes in JSX
const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-clerk-primary text-clerk-primary-contrast hover:bg-clerk-primary-hover border-transparent',
  outline: 'bg-transparent text-clerk-fg border-clerk-border hover:bg-clerk-surface',
  ghost: 'bg-transparent text-clerk-fg border-transparent hover:bg-clerk-surface',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      data-cl-slot='button-root'
      data-variant={variant}
      data-size={size}
      className={clsx(
        'gap-clerk-2 rounded-clerk-md font-clerk-sans inline-flex items-center justify-center font-medium',
        'cursor-pointer border transition-colors duration-150',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
```

```css
/* Option 2: @apply in CSS Module */
@reference "tailwindcss";

.root[data-variant='solid'] {
  @apply bg-clerk-primary text-clerk-primary-contrast border-transparent;
  &:hover {
    @apply bg-clerk-primary-hover;
  }
}
```

Token definition via `@theme` directive in CSS. Build pipeline: Vite + `@tailwindcss/vite`. Dependencies: `tailwindcss` + `@tailwindcss/vite` (build only).

Distribution problem: pre-compiled CSS has `@layer` conflicts with consumer Tailwind. Source distribution requires consumer Tailwind. No clean path for all consumers.

</details>

### Keeping the `appearance` prop alongside CSS variables

We considered maintaining a JavaScript `appearance` prop that would set CSS variables under the hood — a bridge for customers already using the current API. We deferred this because:

- It adds a JS-to-CSS translation layer that re-introduces the complexity we're trying to remove
- CSS variables are strictly more universal — they work in JS frameworks, plain HTML, server components, and with AI agents
- A codemod that converts `appearance.variables` to CSS declarations is a simpler migration path

### Trade-offs in one sentence

- **CSS Modules** trades authoring familiarity for stability, future-proofing, and full CSS language access.
- **Pigment CSS** trades stability and CSS access for authoring familiarity.
- **Tailwind CSS v4** trades distribution simplicity and `light-dark()` for authoring speed and consumer theme unification.

---

## Side-by-Side Comparison

| Dimension               | Current (Emotion)                        | CSS Modules                               | Pigment CSS                                                   | Tailwind CSS v4                                                   |
| ----------------------- | ---------------------------------------- | ----------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Style authoring**     | JS objects via `css`/`sx` props          | Separate `.module.css` files              | JS objects via `styled()`                                     | Utility classes in JSX or `@apply` in CSS                         |
| **Style output**        | Runtime `<style>` injection              | Static CSS file                           | Static CSS file                                               | Static CSS file                                                   |
| **Runtime cost**        | High — style computation on every render | Zero                                      | Zero                                                          | Zero                                                              |
| **Dark mode**           | JS theme swap                            | `light-dark()` CSS function               | `colorSchemes` + class toggle                                 | Class-based (`.dark`) or media query — no `light-dark()`          |
| **Design tokens**       | `InternalTheme` JS object ($-prefixed)   | `--clerk-*` CSS custom properties         | `--clerk-*` via `extendTheme`                                 | `--color-clerk-*` via `@theme` + utility classes                  |
| **User customization**  | `appearance` prop (471 element keys)     | CSS vars + `[data-cl-slot]`               | CSS vars + `styleOverrides` via plugin                        | CSS vars + `[data-cl-slot]`; Tailwind consumers can use `@source` |
| **Consumer setup**      | Zero (runtime injection)                 | `import '@clerk/ui/mosaic.css'`           | `import` or Pigment plugin                                    | `import` or `@source` + `@import`                                 |
| **Build tooling**       | None (runtime)                           | CSS Modules plugin in tsdown              | Separate Vite + Pigment plugin                                | Separate Vite + `@tailwindcss/vite`                               |
| **Library maturity**    | Emotion is stable                        | CSS Modules is a web standard (10+ years) | Pigment CSS v0.0.31 (alpha)                                   | Tailwind v4 released Jan 2025                                     |
| **External dependency** | `@emotion/react`, `@emotion/cache`       | None (build tooling only)                 | `@pigment-css/react` (runtime)                                | `tailwindcss` (build only)                                        |
| **Modern CSS features** | Requires library support                 | Full, unmediated — it's real CSS          | Partial — JS objects can't express `@property`, `@layer` etc. | Partial — works in CSS files, not via utility classes             |
| **Distribution risk**   | N/A                                      | None — static CSS works everywhere        | Medium — alpha dependency                                     | High — `@layer` conflicts with consumer Tailwind                  |
| **SSR / RSC**           | Requires Emotion SSR setup               | Works natively                            | Works natively                                                | Works natively                                                    |

### Modern CSS Feature Access

| CSS Feature       | Current (Emotion)   | CSS Modules | Pigment CSS           | Tailwind CSS v4                                  |
| ----------------- | ------------------- | ----------- | --------------------- | ------------------------------------------------ |
| `@property`       | Not supported       | **Native**  | Requires escape hatch | Works in CSS files, not utilities                |
| `light-dark()`    | Not supported       | **Native**  | Not supported         | Not compatible with Tailwind dark mode           |
| `@layer`          | Partially supported | **Native**  | Not supported         | Tailwind's own `@layer` conflicts with consumers |
| `@scope`          | Not supported       | **Native**  | Not supported         | Works in CSS files, not utilities                |
| `@container`      | Via string keys     | **Native**  | Via string keys       | Via `@container` variants                        |
| `@starting-style` | Not supported       | **Native**  | Not supported         | Works in CSS files, not utilities                |

### Risk Profile

| Factor              | CSS Modules                                 | Pigment CSS                         | Tailwind CSS v4                               |
| ------------------- | ------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| Technology maturity | **Very Low** risk — web standard, 10+ years | **High** risk — v0.0.31 alpha       | **Low** risk — mature tool, v4 features newer |
| Dependency risk     | **None**                                    | **Medium** — runtime dep            | **Low** — build dep only                      |
| Build fragility     | **Low**                                     | **Medium** — WyW-in-JS evaluation   | **Medium** — `@layer` conflicts               |
| Distribution risk   | **None**                                    | **Medium** — plugin fragility       | **High** — unsolved for Tailwind consumers    |
| Team adoption       | **Medium** — CSS file authoring shift       | **Low** — familiar Emotion patterns | **Low** — widely known                        |

---

## Design Tokens

All tokens defined on `:root` using `light-dark()` for automatic dark mode:

```css
:root {
  color-scheme: light dark;

  /* Colors */
  --clerk-color-primary: light-dark(#6c47ff, #8b6fff);
  --clerk-color-primary-hover: light-dark(#5a38e0, #9d85ff);
  --clerk-color-primary-active: light-dark(#4d2fbf, #b3a0ff);
  --clerk-color-primary-muted: light-dark(#6c47ff1a, #8b6fff1a);
  --clerk-color-primary-contrast: light-dark(#ffffff, #ffffff);

  --clerk-color-danger: light-dark(#ef4444, #f87171);
  --clerk-color-danger-hover: light-dark(#dc2626, #fca5a5);

  --clerk-color-bg: light-dark(#ffffff, #111111);
  --clerk-color-fg: light-dark(#111111, #f0f0f0);
  --clerk-color-fg-muted: light-dark(#6b7280, #9ca3af);
  --clerk-color-surface: light-dark(#f8f8f8, #1a1a1a);
  --clerk-color-border: light-dark(#e5e5e5, #333333);
  --clerk-color-input: light-dark(#ffffff, #1a1a1a);
  --clerk-color-ring: light-dark(#6c47ff66, #8b6fff66);

  /* Spacing */
  --clerk-space-1: 0.25rem;
  --clerk-space-2: 0.5rem;
  --clerk-space-3: 0.75rem;
  --clerk-space-4: 1rem;
  --clerk-space-5: 1.25rem;
  --clerk-space-6: 1.5rem;

  /* Radii */
  --clerk-radius-sm: 0.25rem;
  --clerk-radius-md: 0.375rem;
  --clerk-radius-lg: 0.5rem;
  --clerk-radius-full: 9999px;

  /* Typography */
  --clerk-font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --clerk-font-mono: 'Fira Code', ui-monospace, monospace;
  --clerk-font-size-xs: 0.75rem;
  --clerk-font-size-sm: 0.8125rem;
  --clerk-font-size-md: 0.875rem;
  --clerk-font-size-lg: 1rem;
  --clerk-font-weight-normal: 400;
  --clerk-font-weight-medium: 500;
  --clerk-font-weight-semibold: 600;
  --clerk-font-weight-bold: 700;
}
```

### `@property` registered tokens (advanced)

Color tokens can be registered with `@property`, enabling use cases impossible with unregistered custom properties — like animating gradients or using tokens in `color-mix()` with type safety:

```css
@property --clerk-color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #6c47ff;
}

/* Animate a gradient stop — impossible without @property */
[data-cl-slot='button-root'] {
  background: linear-gradient(135deg, var(--clerk-color-primary), var(--clerk-color-ring));
  transition:
    --clerk-color-primary 0.4s,
    --clerk-color-ring 0.4s;
}

/* Browser rejects invalid values — type safety in CSS */
:root {
  --clerk-color-primary: not-a-color; /* ignored, falls back to initial-value */
}
```

---

## Component Pattern

Every Mosaic component follows the same pattern — a `.tsx` file and a `.module.css` file:

**Button.module.css:**

```css
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--clerk-space-2);
  border-radius: var(--clerk-radius-md);
  font-family: var(--clerk-font-sans);
  font-weight: var(--clerk-font-weight-medium);
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.root[data-variant='solid'] {
  background: var(--clerk-color-primary);
  color: var(--clerk-color-primary-contrast);
  border: none;
}
.root[data-variant='solid']:hover {
  background: var(--clerk-color-primary-hover);
}

.root[data-variant='outline'] {
  background: transparent;
  color: var(--clerk-color-fg);
  border: 1px solid var(--clerk-color-border);
}
.root[data-variant='outline']:hover {
  background: var(--clerk-color-surface);
}

.root:focus-visible {
  outline: 2px solid var(--clerk-color-ring);
  outline-offset: 2px;
}

.root:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
```

**Button.tsx:**

```tsx
/** @jsxImportSource react */
import { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      data-cl-slot='button-root'
      className={clsx(styles.root, className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {icon && (
        <span
          data-cl-slot='button-icon'
          className={styles.icon}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  ),
);
```

No `APPEARANCE_KEYS` registry. No `ElementsConfig` type entry. No `makeCustomizable` HOC. No `createVariants` config. The `data-cl-slot` attributes are the public API — stable, inspectable, self-documenting.

---

## Build Pipeline

### CSS Modules config

```js
// In tsdown.config.mts or PostCSS config
generateScopedName: local => `cl-${local}`;
```

Write `.root` in CSS Modules → ships as `.cl-root` in output. Components reference `styles.root` in TypeScript.

### Output

The build concatenates `tokens.css` + all compiled `.module.css` outputs into a single `dist/mosaic.css`. Exposed via package.json exports:

```json
"./mosaic.css": "./dist/mosaic.css"
```

### Emotion coexistence

A separate `tsconfig.mosaic.json` extends the base config but overrides `jsxImportSource` to `"react"` (instead of `"@emotion/react"`), scoped to `src/mosaic/**/*`. The `/** @jsxImportSource react */` pragma in each file also handles this per-file.

---

## Customer Developer Flows

### Importing styles

```tsx
// layout.tsx — one import, done for the lifetime of the app
import '@clerk/ui/mosaic.css';
```

### Customizing colors, fonts, spacing

```css
/* globals.css */
:root {
  --clerk-color-primary: #e63946;
  --clerk-color-primary-hover: #c1121f;
  --clerk-color-bg: #f1faee;
  --clerk-font-sans: 'Geist', sans-serif;
  --clerk-radius-md: 0;
}
```

### Customizing a specific component

```css
[data-cl-slot='button-root'][data-variant='solid'] {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

[data-cl-slot='button-icon'] {
  width: 1em;
  height: 1em;
}

[data-cl-slot='input-root'] {
  border-radius: 0;
}
```

### Dark mode

Colors use `light-dark()` and follow OS preference by default:

```css
/* Force dark mode */
:root {
  color-scheme: dark;
}

/* Override specific dark colors */
:root {
  --clerk-color-primary: light-dark(#e63946, #ff6b6b);
  --clerk-color-bg: light-dark(#ffffff, #0a0a0a);
}
```

---

## Agent-Driven Customization

A `CUSTOMIZATION.md` reference ships with the `@clerk/ui` package, auto-generated from the CSS at build time. It contains every token, every component slot, every data attribute, and copy-paste examples.

Users add one line to their project's `CLAUDE.md`:

```markdown
@node_modules/@clerk/ui/CUSTOMIZATION.md
```

| Goal                             | What to do                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| Change a color, font, or spacing | Override a `--clerk-*` variable on `:root`                    |
| Change one component's look      | Target `[data-cl-slot='component-root']` in CSS               |
| Change a specific variant        | Target `[data-cl-slot='...'][data-variant='...']` selector    |
| Change a sub-element             | Target `[data-cl-slot='component-icon']` (each slot is named) |
| Override dark mode values        | Use `light-dark()` in the variable value                      |

The auto-generation script reads compiled `mosaic.css` and extracts all `--clerk-*` properties, `[data-cl-slot]` selectors, and `[data-*]` attribute values, grouped by component.

---

## Rollout Plan

### Phase 1: Foundation (exploration)

- Create `packages/ui/src/mosaic/` with token definitions (`tokens.css`) and build pipeline
- Build the initial three components: Button, Input, Select
- Wire up the `playground/composed` app to render Mosaic components alongside existing composed components
- Validate: dark mode toggle, CSS variable overrides, `className` forwarding, variant resolution

### Phase 2: Validation

- Expand the component set based on what the composed API surface needs (Spinner, Badge, Alert, etc.)
- Build the `CUSTOMIZATION.md` auto-generation script
- Test with a real Next.js consumer app
- Gather feedback from the team on the authoring experience

### Phase 3: Composed API integration

- Wire Mosaic primitives into the composed `UserProfile` and `OrganizationProfile` components
- Evaluate whether the component injection system should use Mosaic as the default primitive set
- Assess whether the existing appearance cascade can be sunset for composed-mode consumers

### Phase 4: Migration path

- Document the migration guide for customers moving from `appearance` prop to CSS variable overrides
- Provide a compatibility layer or codemod if feasible (e.g., convert `appearance.variables.colorPrimary` to `--clerk-color-primary`)
- Plan deprecation timeline for the Emotion-based appearance system

### Verification

1. **Build**: `turbo build --filter=@clerk/ui` — verify `dist/mosaic.css` exists with `cl-` prefixed class names and tokens
2. **Playground**: Import `@clerk/ui/mosaic.css` in composed playground, render Button/Input/Select variants
3. **Dark mode**: Toggle `color-scheme: dark` on root — verify `light-dark()` tokens switch
4. **Customization**: Override `--clerk-color-primary` on `:root` — verify components pick up the change
5. **External targeting**: Add `[data-cl-slot='button-root'][data-variant='solid'] { text-transform: uppercase }` — verify it applies
6. **TypeScript**: Verify `styles.root` has type safety via CSS Module declaration
7. **Emotion isolation**: Verify Mosaic components don't go through Emotion's JSX factory

---

## Composed Profile API

The composed profile providers (`UserProfile.Provider`, `OrganizationProfile.Provider`) now support full section-level composition and functional parity with the AIO `<UserProfile />` / `<OrganizationProfile />` components. Features like Coinbase wallet connect, password strength scoring, and navigation (leave org, delete org, cross-section links) all work through the composed API.

**Requirement**: `ui={ui}` must be passed to `<ClerkProvider>` when using composed components.

```tsx
import { ui } from '@clerk/ui';
import { ClerkProvider } from '@clerk/react';

<ClerkProvider
  publishableKey={pk}
  ui={ui}
>
  <UserProfile.Provider>...</UserProfile.Provider>
</ClerkProvider>;
```

### ModuleManager — real dynamic imports for composed providers

**Problem**: Composed providers used a stub `ModuleManager` that returned `undefined` for all dynamic imports. This broke Coinbase wallet connect, Base wallet connect, and password strength scoring.

**Root cause**: The real `ModuleManager` is created inside `clerk.load()` (in clerk-js) and passed to the `ClerkUI` constructor. But the composed providers render in the user's React tree — they had no way to access it.

**Implemented approach**: Module-level singleton store in `@clerk/ui`. When `ClerkUI` is constructed (happens when `ui={ui}` is passed), it stores the `moduleManager` in a module-level variable. The composed providers read from that store.

**Files**:

- `packages/ui/src/composed/moduleManagerStore.ts` — `setModuleManager()` / `getModuleManager()`
- `packages/ui/src/ClerkUI.ts` — calls `setModuleManager(moduleManager)` in constructor
- Both provider files — read from store

**Caveat**: Only works when `ui={ui}` is passed. Without it, ClerkUI loads from CDN as a separate bundle (different module scope), so the store is never populated.

### Router — real navigation for composed providers

**Problem**: The stub router only handled external URLs. Same-origin paths were silently dropped, breaking leave/delete organization, cross-section links, and error card back buttons.

**Implemented approach**: `createComposedRouter(clerkNavigate)` factory that delegates all navigation to `clerk.navigate`.

**Files**:

- `packages/ui/src/composed/stubRouter.ts` — `createComposedRouter()` factory
- Both provider files — `useMemo(() => createComposedRouter(clerk.navigate), [clerk])`

### Known Issues

- **clerk-js loads from CDN, not local source**: Changes to `packages/clerk-js/src/core/clerk.ts` have no effect until published. This is why the `__internal_moduleManager` getter approach was abandoned.
- **`@clerk/ui` dist must be rebuilt for playground testing**: Run `pnpm turbo build --filter=@clerk/ui --force` after changes.
- **Spinner layout shift in composed mode**: Loading spinner causes slight content shift — cosmetic, not yet fixed.

### Test Coverage Gaps

- No tests render through `UserProfileProvider` (only `MockClerkProvider`) — the `moduleManagerStore` path is not exercised
- No integration test for `ui={ui}` → `setModuleManager` → composed provider flow
- No test for the wallet connect flow through composed providers
- No test for the fallback path when `getModuleManager()` returns `undefined`

---

## Component Injection

Pass custom primitive components to `<ClerkProvider>` to replace Clerk's built-in UI primitives across all Clerk components.

```tsx
import { ClerkProvider } from '@clerk/nextjs'

<ClerkProvider
  publishableKey={...}
  components={{
    button: MyButton,
    input: MyInput,
    alert: MyAlert,
  }}
>
  <App />
</ClerkProvider>
```

Every Clerk component (`<SignIn />`, `<UserProfile />`, composed components, modals, drawers) will use your components instead of Clerk's defaults.

### Available slots

| Slot      | What it replaces                                                 | Element type |
| --------- | ---------------------------------------------------------------- | ------------ |
| `button`  | All buttons (primary actions, secondary actions, social buttons) | `<button>`   |
| `input`   | Text inputs, checkboxes, radio buttons                           | `<input>`    |
| `alert`   | Inline alerts and error banners                                  | `<div>`      |
| `spinner` | Loading spinners                                                 | `<span>`     |
| `badge`   | Status badges and tags                                           | `<span>`     |

### Props your components receive

Custom components receive **standard HTML attributes only** — no Clerk-specific prop interfaces. Any component library works out of the box.

**Button** receives `React.ButtonHTMLAttributes<HTMLButtonElement>` plus:

- `data-variant`: `'solid' | 'outline' | 'ghost' | 'link' | 'linkDanger'`
- `data-color`: `'primary' | 'secondary' | 'neutral' | 'danger'`
- `data-loading`: present when loading

**Input** receives `React.InputHTMLAttributes<HTMLInputElement>` plus:

- `aria-invalid`: `true` when field has an error
- `data-variant`: `'default'`

**Alert** receives `React.HTMLAttributes<HTMLDivElement>` plus:

- `data-color`: `'danger' | 'info' | 'warning'`

### Example with shadcn/ui

```tsx
<ClerkProvider
  components={{
    button: props => {
      const variant =
        props['data-variant'] === 'outline'
          ? 'outline'
          : props['data-variant'] === 'ghost'
            ? 'ghost'
            : props['data-variant'] === 'link'
              ? 'link'
              : 'default';
      const destructive = props['data-color'] === 'danger';
      return (
        <Button
          {...props}
          variant={destructive ? 'destructive' : variant}
        />
      );
    },
    input: props => <Input {...props} />,
  }}
/>
```

### Styling

Custom components **bypass Clerk's appearance system entirely**. No Clerk CSS classes or Emotion styles are applied. Your component is fully responsible for its own styling. Use `data-*` attributes for conditional styling.

### What is NOT replaceable

- Layout primitives (`Box`, `Flex`, `Grid`) — structural, not user-facing
- Typography (`Text`, `Heading`, `Link`) — use the `appearance` prop
- Cards, Modals, Drawers — use the `appearance` prop
- Section-level components — the composed API handles section customization

---

## Speculative Changelog Post

### Introducing Mosaic: Clerk's new CSS-based design system

**TL;DR:** Clerk components now ship as a static CSS file. Customize with CSS variables. No JavaScript API needed.

**What's new:**

- **One CSS import**: `import '@clerk/ui/mosaic.css'` — that's the entire setup
- **CSS variable customization**: Override `--clerk-color-primary`, `--clerk-font-sans`, `--clerk-radius-md` on `:root`
- **Stable slot attributes**: Target `[data-cl-slot='button-root']` with your own CSS. Every styleable element has a named slot visible in DevTools.
- **Dark mode built in**: Colors use `light-dark()` and follow OS preference. Force a mode with `color-scheme: dark`.
- **Modern CSS features**: Full access to `@property`, `@layer`, `@container`, native nesting — no library intermediary
- **Agent-friendly**: `CUSTOMIZATION.md` ships with the package for AI coding agents

**What this replaces:**
The `appearance` prop, `@clerk/themes`, the `elements` / `variables` JavaScript API, and runtime style injection. These continue to work for existing components but are no longer needed for Mosaic-based components.

**What this means for you:**

- Faster page loads — no runtime style computation
- Smaller bundles — no Emotion runtime shipped to the client
- Cacheable styles — static `.css` file, cached by the browser
- Simpler customization — it's just CSS

---

## Impact on Other Parts of the Product

### `@clerk/themes` package

Prebuilt themes (`dark`, `shadcn`, `neobrutalism`, `shadesOfPurple`) are JavaScript objects designed for the `appearance` prop. They don't apply to Mosaic components. Equivalent Mosaic themes would be plain CSS files that override `--clerk-*` variables.

### `clerk-js` CDN bundle

The Rspack UMD build (`ui.browser.js`) bundles Emotion and the full theming infrastructure. Mosaic components would need a separate entry point or a migration of the CDN bundle to include the static CSS.

### Existing customers

No breaking change. The `appearance` prop and Emotion-based components continue to work. Mosaic is additive — customers opt in by importing `mosaic.css` and using Mosaic components.

### Documentation

The `appearance` prop documentation is extensive. Mosaic documentation is simpler (CSS variable reference + slot reference) but needs to be written. The auto-generated `CUSTOMIZATION.md` covers the technical reference.

### Component injection

Mosaic primitives are natural candidates for the default component set in the injection system. Their API (standard HTML attributes + `data-*` variants + `className` forwarding) aligns with the injection plan's requirement for components that accept standard HTML attributes.
