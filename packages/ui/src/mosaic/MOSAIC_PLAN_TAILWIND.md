# Mosaic: Tailwind CSS v4 Plan

## Context

Clerk's current theming system uses Emotion CSS-in-JS with a complex appearance cascade — runtime style injection, 200+ targetable element keys, auto-generated color scales, and a multi-layer parsing pipeline. Mosaic replaces this with static CSS.

This plan evaluates Tailwind CSS v4 as the primary styling approach. Tailwind v4's shift to CSS-first configuration (`@theme` replaces `tailwind.config.js`) and its native CSS custom property output make it worth reconsidering — especially when the consumer app already uses Tailwind.

This is an exploration — new primitives only (Button, Input, Select), living alongside the existing Emotion system.

---

## Why Tailwind CSS v4

- **CSS-first configuration**: `@theme` directive in CSS replaces the JS config file — tokens are defined in CSS, not JS
- **Native CSS custom properties**: `@theme` variables emit `:root` CSS vars automatically, accessible to any CSS
- **Familiar authoring**: Large developer population already uses Tailwind — minimal learning curve for Clerk developers
- **Utility-first DX**: Rapid prototyping with utility classes, variants expressed inline
- **Consumer alignment**: Many Clerk customers already have Tailwind — potential for theme unification
- **Zero runtime**: Output is static CSS (same as CSS Modules)

---

## Decisions

| Decision            | Choice                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------- |
| CSS strategy        | Tailwind CSS v4 (utility-first, build-time extraction)                                    |
| Scope               | New primitives only: Button, Input, Select                                                |
| Location            | `packages/ui/src/mosaic/`                                                                 |
| Token namespace     | `--clerk-*` CSS custom properties (via `@theme` with custom namespace)                    |
| Token granularity   | Semantic only (`--clerk-color-primary-hover`, not numbered scales)                        |
| Token scoping       | `:root` (Tailwind v4 default for `@theme`)                                                |
| Dark mode           | `@variant dark` + `prefers-color-scheme`, or class-based via `@custom-variant`            |
| Variants            | Tailwind variant classes (`data-[variant=solid]:bg-primary`) or `@apply` in component CSS |
| Component API       | `className` + `ref` forwarding (standard React primitives)                                |
| CSS delivery        | Single `import '@clerk/ui/mosaic.css'`                                                    |
| Public selector API | `data-cl-slot` attributes (e.g., `data-cl-slot="button-root"`)                            |
| Emotion coexistence | Separate `tsconfig.mosaic.json` with `jsxImportSource: "react"`                           |
| User customization  | Override `--clerk-*` CSS vars + target `[data-cl-slot]` selectors                         |

---

## Distribution Model

This is the critical decision point. Tailwind v4 has two distribution paths, and neither is clean for a component library.

### Approach A: Ship source — consumer compiles

The library ships component files with Tailwind class names. The consumer's Tailwind build scans them via `@source`:

```css
/* Consumer's app.css */
@import 'tailwindcss';
@import '@clerk/ui/mosaic/theme.css';
@source "../node_modules/@clerk/ui/dist";
```

**Pros**: Theme unification — consumer's `@theme` tokens and Clerk's tokens share one Tailwind build. No duplicate CSS.

**Cons**: Requires every consumer to have Tailwind v4 installed and configured. Non-Tailwind consumers cannot use Clerk components.

### Approach B: Ship pre-compiled CSS — no consumer Tailwind required

Clerk compiles its own Tailwind at build time and ships a static `mosaic.css`:

```tsx
import '@clerk/ui/mosaic.css';
```

**Pros**: Zero consumer setup. Works like CSS Modules approach.

**Cons**: When the consumer also uses Tailwind v4, the library's compiled CSS includes `@layer` declarations that can conflict with the consumer's `@layer` declarations — a documented issue (GitHub #17954, #18758). The library's `@layer utilities` and the consumer's `@layer utilities` interact unpredictably.

### Approach C: Hybrid — ship both paths

Ship pre-compiled CSS as default, raw source via a separate export for Tailwind consumers:

```json
{
  "./mosaic": "./dist/mosaic/index.js",
  "./mosaic.css": "./dist/mosaic.css",
  "./mosaic/tailwind": "./src/mosaic/theme.css"
}
```

Default consumers import the CSS file. Tailwind consumers import the theme and add `@source` for component scanning.

**Pros**: Supports both audiences.

**Cons**: Two distribution paths to maintain and test. The pre-compiled path still has `@layer` conflict potential. The `@source` path requires consumers to understand Tailwind's scanning model.

---

## Theme Configuration

### Token definition via `@theme`

```css
/* packages/ui/src/mosaic/theme.css */
@theme {
  /* Wipe Tailwind defaults to avoid shipping unused utilities */
  --color-*: initial;
  --spacing-*: initial;
  --radius-*: initial;
  --font-*: initial;

  /* Clerk tokens — these emit as CSS custom properties on :root
     AND generate Tailwind utility classes */
  --color-clerk-primary: oklch(0.53 0.21 281);
  --color-clerk-primary-hover: oklch(0.45 0.21 281);
  --color-clerk-primary-active: oklch(0.4 0.21 281);
  --color-clerk-primary-muted: oklch(0.53 0.21 281 / 0.1);
  --color-clerk-primary-contrast: #ffffff;
  --color-clerk-danger: oklch(0.58 0.22 27);
  --color-clerk-danger-hover: oklch(0.5 0.22 27);
  --color-clerk-bg: oklch(1 0 0);
  --color-clerk-fg: oklch(0.15 0 0);
  --color-clerk-fg-muted: oklch(0.55 0 0);
  --color-clerk-surface: oklch(0.97 0 0);
  --color-clerk-border: oklch(0.9 0 0);
  --color-clerk-input: oklch(1 0 0);
  --color-clerk-ring: oklch(0.53 0.21 281 / 0.4);

  --spacing-clerk-1: 0.25rem;
  --spacing-clerk-2: 0.5rem;
  --spacing-clerk-3: 0.75rem;
  --spacing-clerk-4: 1rem;
  --spacing-clerk-5: 1.25rem;
  --spacing-clerk-6: 1.5rem;

  --radius-clerk-sm: 0.25rem;
  --radius-clerk-md: 0.375rem;
  --radius-clerk-lg: 0.5rem;
  --radius-clerk-full: 9999px;

  --font-clerk-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-clerk-mono: 'Fira Code', ui-monospace, monospace;
}
```

This generates CSS custom properties on `:root`:

```css
:root {
  --color-clerk-primary: oklch(0.53 0.21 281);
  --color-clerk-primary-hover: oklch(0.45 0.21 281);
  --spacing-clerk-1: 0.25rem;
  --radius-clerk-md: 0.375rem;
  --font-clerk-sans: 'Inter', system-ui, ...;
}
```

AND generates utility classes: `bg-clerk-primary`, `text-clerk-fg`, `rounded-clerk-md`, `p-clerk-2`, `font-clerk-sans`.

### Dark mode

```css
/* In theme.css */
@custom-variant dark (&:where(.dark, .dark *));

/* Or use built-in prefers-color-scheme: */
/* dark: variants just work with @media (prefers-color-scheme: dark) */
```

Dark token overrides:

```css
.dark {
  --color-clerk-primary: oklch(0.63 0.18 281);
  --color-clerk-primary-hover: oklch(0.68 0.18 281);
  --color-clerk-bg: oklch(0.15 0 0);
  --color-clerk-fg: oklch(0.94 0 0);
  --color-clerk-fg-muted: oklch(0.65 0 0);
  --color-clerk-surface: oklch(0.18 0 0);
  --color-clerk-border: oklch(0.28 0 0);
  --color-clerk-input: oklch(0.18 0 0);
  --color-clerk-ring: oklch(0.63 0.18 281 / 0.4);
}
```

Note: `light-dark()` CSS function is NOT compatible with Tailwind's dark mode model. Tailwind expects class or media query toggling, not `color-scheme` property switching. This is a regression from the CSS Modules approach where `light-dark()` works natively.

---

## Component Pattern

### Option 1: Utility classes in JSX

```tsx
// packages/ui/src/mosaic/Button.tsx
/** @jsxImportSource react */
import { forwardRef } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    'bg-clerk-primary text-clerk-primary-contrast hover:bg-clerk-primary-hover active:bg-clerk-primary-active border-transparent',
  outline: 'bg-transparent text-clerk-fg border-clerk-border hover:bg-clerk-surface',
  ghost: 'bg-transparent text-clerk-fg border-transparent hover:bg-clerk-surface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-clerk-2 py-clerk-1 text-xs',
  md: 'px-clerk-4 py-clerk-2 text-sm',
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
        'focus-visible:outline-clerk-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
```

### Option 2: CSS file with `@apply` + `@reference`

```css
/* Button.module.css */
@reference "tailwindcss";

.root {
  @apply gap-clerk-2 rounded-clerk-md font-clerk-sans inline-flex cursor-pointer items-center justify-center border font-medium transition-colors duration-150;

  &:focus-visible {
    @apply outline-clerk-ring outline-2 outline-offset-2;
  }
  &:disabled {
    @apply cursor-not-allowed opacity-50;
  }
}

.root[data-variant='solid'] {
  @apply bg-clerk-primary text-clerk-primary-contrast border-transparent;
  &:hover {
    @apply bg-clerk-primary-hover;
  }
  &:active {
    @apply bg-clerk-primary-active;
  }
}

.root[data-variant='outline'] {
  @apply text-clerk-fg border-clerk-border bg-transparent;
  &:hover {
    @apply bg-clerk-surface;
  }
}

.root[data-variant='ghost'] {
  @apply text-clerk-fg border-transparent bg-transparent;
  &:hover {
    @apply bg-clerk-surface;
  }
}
```

```tsx
// Button.tsx
/** @jsxImportSource react */
import { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      data-cl-slot='button-root'
      className={clsx(styles.root, className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
);
```

**Option 2 is closer to CSS Modules** — the `@apply` + `@reference` pattern gives you Tailwind's utility vocabulary in a CSS file without embedding class strings in JSX. But at that point, Tailwind is functioning as a utility preprocessor over CSS Modules — the question is whether the indirection adds value over writing the CSS directly.

---

## File Structure

### Option 1: Utility classes in JSX

```
packages/ui/src/mosaic/
├── theme.css               # @theme tokens + dark mode overrides
├── Button.tsx              # Button (utility classes inline)
├── Input.tsx               # Input (utility classes inline)
├── Select.tsx              # Select (utility classes inline)
└── index.ts                # Public exports
```

### Option 2: CSS Modules + @apply

```
packages/ui/src/mosaic/
├── theme.css               # @theme tokens + dark mode overrides
├── Button.tsx              # Button component
├── Button.module.css       # Button styles (@apply + @reference)
├── Input.tsx               # Input component
├── Input.module.css        # Input styles
├── Select.tsx              # Select component
├── Select.module.css       # Select styles
└── index.ts                # Public exports
```

---

## Build Pipeline

### Tailwind v4 build for Mosaic

```ts
// packages/ui/vite.mosaic.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: './src/mosaic/index.ts',
      formats: ['es'],
    },
    outDir: 'dist/mosaic',
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

### Entry CSS that triggers Tailwind compilation

```css
/* packages/ui/src/mosaic/mosaic.css */
@import 'tailwindcss';
@import './theme.css';
```

### Package.json additions

```json
{
  "scripts": {
    "build:mosaic": "vite build --config vite.mosaic.config.ts"
  },
  "exports": {
    "./mosaic": "./dist/mosaic/index.js",
    "./mosaic.css": "./dist/mosaic.css"
  },
  "devDependencies": {
    "tailwindcss": "^4.1",
    "@tailwindcss/vite": "^4.1"
  }
}
```

### Emotion coexistence

Same as CSS Modules plan — `tsconfig.mosaic.json` with `jsxImportSource: "react"` + per-file pragma.

---

## User Customization

### Override tokens (all consumers)

```css
:root {
  --color-clerk-primary: hotpink;
  --radius-clerk-md: 0;
  --font-clerk-sans: 'Geist', sans-serif;
}
```

### Target specific components (all consumers)

```css
[data-cl-slot='button-root'][data-variant='solid'] {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### For Tailwind consumers — theme unification

```css
/* Consumer's app.css */
@import 'tailwindcss';
@import '@clerk/ui/mosaic/tailwind';
@source "../node_modules/@clerk/ui/dist";

/* Consumer can now use Clerk tokens as Tailwind utilities */
/* bg-clerk-primary, text-clerk-fg, etc. work in their own components */
```

---

## Comparison: Tailwind vs CSS Modules for Mosaic

| Dimension                       | CSS Modules                                          | Tailwind CSS v4                                                                                                    |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Style authoring**             | Plain CSS in `.module.css` files                     | Utility classes in JSX or `@apply` in CSS files                                                                    |
| **Token definition**            | Hand-authored `tokens.css` with `--clerk-*` vars     | `@theme` directive — emits CSS vars + utility classes                                                              |
| **Dark mode**                   | `light-dark()` CSS function (single declaration)     | Class-based (`.dark`) or `prefers-color-scheme` media query — requires separate variable block                     |
| **Modern CSS features**         | Full, unmediated — it's plain CSS                    | `@property`, `@layer`, `@scope` etc. work in CSS files alongside Tailwind, but not expressible via utility classes |
| **Distribution**                | Static CSS file, no conflicts                        | Static CSS has `@layer` conflicts with consumer Tailwind; source distribution requires consumer Tailwind           |
| **Consumer dependency**         | None — just CSS                                      | None for pre-compiled; requires `tailwindcss` v4 for source path                                                   |
| **New dependency for Clerk**    | None (CSS Modules is a web standard)                 | `tailwindcss` + `@tailwindcss/vite` as devDependencies                                                             |
| **Customization (consumer)**    | CSS variable overrides + `[data-cl-slot]` targeting  | Same — CSS variable overrides + `[data-cl-slot]` targeting                                                         |
| **Authoring DX for Clerk devs** | Standard CSS — everyone knows it                     | Tailwind utilities — faster for devs who know Tailwind                                                             |
| **Agent parseability**          | Class names are semantic (`.root`, `[data-variant]`) | Utility strings are opaque (`inline-flex items-center justify-center gap-2...`)                                    |
| **Build complexity**            | CSS Modules plugin in existing tsdown                | Separate Vite build with Tailwind plugin                                                                           |
| **Colocation**                  | Styles in separate `.module.css` file                | Option 1: styles in JSX. Option 2: separate `.module.css` file with `@apply`                                       |
| **Library maturity**            | CSS Modules is a stable web standard, 10+ years      | Tailwind v4 released Jan 2025, `@theme`/`@reference` are new                                                       |

---

## Critical Concerns

### 1. `@layer` conflicts — the biggest risk

When Clerk ships pre-compiled Tailwind CSS and the consumer also uses Tailwind v4, both outputs contain `@layer base, theme, components, utilities`. The browser sees two competing layer declarations — the specificity ordering between them is undefined. This means:

- A consumer's `@layer utilities` rule might override a Clerk component style, or vice versa
- The cascade order depends on CSS import order, which is fragile
- This is a documented issue with no official solution from the Tailwind team yet

**Mitigation options:**

- Wrap Clerk's output in a custom `@layer clerk` — but then it's always lower priority than Tailwind's default layers
- Ship only the source path and require consumers to compile — eliminates the conflict but requires Tailwind
- Strip `@layer` from Clerk's output in a post-processing step — brittle and may break specificity

### 2. No `light-dark()` support

Tailwind's dark mode model uses class toggling (`.dark`) or media queries, not the `color-scheme` property. The `light-dark()` CSS function is incompatible with this model — you can't use single-declaration dark mode values. Instead you need:

```css
:root {
  --color-clerk-bg: oklch(1 0 0);
}
.dark {
  --color-clerk-bg: oklch(0.15 0 0);
}
```

vs CSS Modules:

```css
:root {
  --clerk-color-bg: light-dark(#ffffff, #111111);
}
```

The CSS Modules approach is a single declaration per token. Tailwind requires two blocks — one for light, one for dark. This doubles the token maintenance surface.

### 3. Consumer's Tailwind may conflict with Clerk's Tailwind

If Clerk ships Tailwind's preflight/reset CSS and the consumer also has Tailwind's preflight, the reset runs twice. The output includes duplicate `*, ::before, ::after { box-sizing: border-box; }` and similar reset rules.

For the source distribution path, the consumer includes Clerk's theme but NOT `@import "tailwindcss"` from Clerk — the consumer's own Tailwind handles that. But this means the consumer must understand that they should NOT import `mosaic.css` when using the source path.

### 4. Token namespace collision

Tailwind v4's `@theme` maps variable names directly to utility class names. If Clerk uses `--color-clerk-primary`, the utility class is `bg-clerk-primary`. If the consumer defines their own `--color-primary`, there's no collision — the `clerk-` prefix prevents it. But if the consumer uses `@theme { --color-*: initial; }` to wipe defaults, it also wipes Clerk's `--color-clerk-*` tokens.

---

## Risks & Considerations

| Risk                                        | Level      | Mitigation                                                                                                         |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `@layer` conflicts with consumer Tailwind   | **High**   | No clean solution. Source-only distribution avoids it but requires consumer Tailwind.                              |
| No `light-dark()` support                   | **Medium** | Use class-based dark mode with separate variable blocks. More code, same result.                                   |
| Tailwind v4 `@theme`/`@reference` are new   | **Medium** | v4 is production-ready (Jan 2025) but `@reference` and advanced `@theme` patterns are young.                       |
| Consumer must understand distribution model | **Medium** | Document clearly. Two paths = two sets of instructions = two failure modes.                                        |
| Utility class strings in JSX are opaque     | **Low**    | Use `@apply` in CSS files (Option 2) to keep JSX clean. But then Tailwind is just a preprocessor over CSS Modules. |
| Tailwind becomes a build dependency         | **Low**    | Dev dependency only — `tailwindcss` + `@tailwindcss/vite`. Not shipped to consumers (pre-compiled path).           |

---

## Honest Assessment

### Where Tailwind wins

1. **Authoring speed for Clerk developers** — if the team knows Tailwind, writing `bg-clerk-primary text-clerk-primary-contrast hover:bg-clerk-primary-hover` is faster than writing the equivalent CSS declarations
2. **Token → utility class generation** — `@theme` automatically creates utility classes from token definitions, which is convenient during development
3. **Consumer theme unification** — Tailwind-using consumers could import Clerk's `@theme` tokens and use them in their own components (`bg-clerk-primary` works everywhere)

### Where Tailwind loses

1. **Distribution is the unsolved problem.** CSS Modules ships a static CSS file that works everywhere. Tailwind's pre-compiled output has `@layer` conflicts with consumer Tailwind. The source path requires consumer Tailwind. There's no path that "just works" for all consumers.
2. **`light-dark()` is strictly better than class-based dark mode** for a component library. One declaration vs two blocks. No JS needed to toggle. Follows OS preference by default. Tailwind can't use it.
3. **Modern CSS features like `@property` are second-class.** They work in CSS files alongside Tailwind, but you can't express them via utility classes — you'd fall back to plain CSS for `@property`, `@scope`, `@starting-style`, etc. At that point you're mixing two authoring models.
4. **Agent parseability.** `[data-cl-slot='button-root']` and `--clerk-color-primary` are semantic and self-documenting. `inline-flex items-center justify-center gap-2 rounded-md font-medium` is a description of physical styles, not a semantic identifier. Agents can target the former; they'd have to reverse-engineer the latter.
5. **The `@apply` escape hatch negates the point.** If you use `@apply` in CSS Module files to avoid utility classes in JSX, Tailwind is functioning as a preprocessor over CSS Modules. You get Tailwind's build complexity without its primary benefit (utility classes in JSX). At that point, just write CSS.

### The fundamental tension

Tailwind's value proposition is **authoring convenience** — utility classes are faster to write than CSS declarations. But Mosaic's primary design goal is **consumer experience** — easy customization via CSS variables and `data-cl-slot` selectors, no framework dependency, works with any CSS approach.

Tailwind improves the author side but introduces real problems on the consumer side (`@layer` conflicts, dark mode limitations, distribution complexity). CSS Modules has no consumer-side problems — the output is just CSS.

---

## Verification Plan

1. **Build**: Run Tailwind v4 build via Vite — verify `dist/mosaic.css` contains compiled utilities and `--color-clerk-*` variables
2. **Standalone consumer**: Import `mosaic.css` in a non-Tailwind app — verify components render correctly
3. **Tailwind consumer**: Import `mosaic.css` in a Tailwind v4 app — test for `@layer` conflicts
4. **Source consumer**: Use `@source` + `@import` of Clerk's `theme.css` in a Tailwind v4 app — verify theme unification works
5. **Dark mode**: Toggle `.dark` class — verify variable switching
6. **`data-cl-slot` targeting**: Apply external CSS via `[data-cl-slot='button-root']` — verify it works
7. **Token override**: Set `--color-clerk-primary` on `:root` — verify components update
8. **Emotion isolation**: Verify Mosaic components don't use Emotion's JSX factory
