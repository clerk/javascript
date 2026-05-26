# Mosaic: New Design System Primitives

## Context

Clerk's current theming system uses Emotion CSS-in-JS with a complex appearance cascade — runtime style injection, 200+ targetable element keys, auto-generated color scales, and a multi-layer parsing pipeline (`parseAppearance` → `parseVariables` → `makeCustomizable`). This powers deep customization but adds significant complexity and runtime cost.

Mosaic is a new set of primitive components that replace Emotion with CSS Modules and CSS custom properties. The goal is to simplify: ship a static stylesheet, use semantic design tokens as CSS variables, and let users customize with plain CSS. No JS appearance prop needed.

This is an exploration — new primitives only (Button, Input, Select), living alongside the existing system. The current Emotion-based components remain untouched.

---

## Decisions

| Decision            | Choice                                                                            |
| ------------------- | --------------------------------------------------------------------------------- |
| CSS strategy        | CSS Modules (build-time scoped)                                                   |
| Scope               | New primitives only: Button, Input, Select                                        |
| Location            | `packages/ui/src/mosaic/`                                                         |
| Token namespace     | Reuse `--clerk-*` CSS custom properties                                           |
| Token granularity   | Semantic only (e.g., `--clerk-color-primary-hover`, not numbered scales)          |
| Token scoping       | `:root`                                                                           |
| Dark mode           | `light-dark()` function, controlled via `color-scheme` property                   |
| Variants            | `data-*` attributes targeted by CSS attribute selectors                           |
| Component API       | `className` + `ref` forwarding (standard React primitives)                        |
| CSS delivery        | Single `import '@clerk/ui/mosaic.css'`                                            |
| Class naming        | `generateScopedName` auto-prepends `cl-` (write `.button`, ships as `.cl-button`) |
| Emotion coexistence | Separate `tsconfig.mosaic.json` with `jsxImportSource: "react"`                   |
| User customization  | Pure CSS — override `--clerk-*` vars, target `cl-*` classes                       |
| Tokens file         | Single `tokens.css` in `src/mosaic/`, bundled first in `mosaic.css`               |

---

## File Structure

```
packages/ui/src/mosaic/
├── tokens.css              # Design token CSS custom properties
├── Button.tsx              # Button component
├── Button.module.css       # Button styles
├── Input.tsx               # Input component
├── Input.module.css        # Input styles
├── Select.tsx              # Select component
├── Select.module.css       # Select styles
└── index.ts                # Public exports
```

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

Users force dark mode by setting `color-scheme: dark` on any parent element. Users override tokens by redefining them on `:root`.

### Registered custom properties via `@property`

Color tokens should be registered with `@property` to enable animated theme transitions and browser-level type checking:

```css
@property --clerk-color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #6c47ff;
}

@property --clerk-color-bg {
  syntax: '<color>';
  inherits: true;
  initial-value: #ffffff;
}

/* ... register all color tokens */
```

This enables:

- **Animatable tokens** — smooth `transition` between theme colors (CSS custom properties are not animatable by default, `@property` registration makes them animatable)
- **Browser-level type checking** — invalid values are rejected, falls back to `initial-value`
- **True fallback mechanism** — `initial-value` provides a real default, independent of the `var()` fallback syntax
- **Inheritance control** — explicitly declare that tokens inherit through the DOM tree

Usage in component styles:

```css
.button[data-variant='solid'] {
  background: var(--clerk-color-primary);
  transition: background 0.2s ease;
  /* Smooth color transition when theme changes — only works because
     --clerk-color-primary is registered via @property with syntax: '<color>' */
}
```

---

## Modern CSS Features

Writing real CSS files (not JS objects compiled to CSS) gives unmediated access to every current and future CSS feature. No translation layer, no waiting for a library to add support.

Features available for use in Mosaic component styles:

| Feature           | Use case                                           |
| ----------------- | -------------------------------------------------- |
| `@property`       | Animatable tokens, type-checked custom properties  |
| `light-dark()`    | Single-declaration dark mode values                |
| `@layer`          | Cascade ordering control                           |
| `@scope`          | Scoping styles without class name hashing          |
| `@container`      | Container queries for responsive components        |
| `@starting-style` | Entry animations for elements appearing in the DOM |
| Native nesting    | Cleaner pseudo-selector and child selector syntax  |
| `:has()`          | Parent selectors based on child state              |
| `color-mix()`     | Dynamic color manipulation in CSS                  |

These features work today in CSS files. In a JS-to-CSS system (Emotion, Pigment CSS), each feature requires explicit library support — `@property`, `@layer`, `@scope`, and `@starting-style` have no natural JS object representation.

---

## Component Pattern

Every Mosaic component follows the same pattern:

```css
/* Button.module.css */
.button {
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
    border-color 0.15s,
    color 0.15s;
}

.button[data-size='sm'] {
  padding: var(--clerk-space-1) var(--clerk-space-2);
  font-size: var(--clerk-font-size-xs);
}
.button[data-size='md'] {
  padding: var(--clerk-space-2) var(--clerk-space-4);
  font-size: var(--clerk-font-size-sm);
}

.button[data-variant='solid'] {
  background: var(--clerk-color-primary);
  color: var(--clerk-color-primary-contrast);
  border: none;
}
.button[data-variant='solid']:hover {
  background: var(--clerk-color-primary-hover);
}

.button[data-variant='outline'] {
  background: transparent;
  color: var(--clerk-color-fg);
  border: 1px solid var(--clerk-color-border);
}
.button[data-variant='outline']:hover {
  background: var(--clerk-color-surface);
}

.button[data-variant='ghost'] {
  background: transparent;
  color: var(--clerk-color-fg);
  border: none;
}
.button[data-variant='ghost']:hover {
  background: var(--clerk-color-surface);
}

.button:focus-visible {
  outline: 2px solid var(--clerk-color-ring);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```tsx
/* Button.tsx */
/** @jsxImportSource react */
import { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(styles.button, className)}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  ),
);
```

---

## Build Pipeline

### CSS Modules config

```js
// In tsdown.config.mts or PostCSS config
generateScopedName: local => `cl-${local}`;
```

Write `.button` in CSS Modules → ships as `.cl-button` in output. Components reference `styles.button` in TypeScript.

### Output

The build concatenates `tokens.css` + all compiled `.module.css` outputs into a single `dist/mosaic.css`. Exposed via package.json exports:

```json
"./mosaic.css": "./dist/mosaic.css"
```

### Emotion coexistence

A separate `tsconfig.mosaic.json` extends the base config but overrides `jsxImportSource` to `"react"` (instead of `"@emotion/react"`), scoped to `src/mosaic/**/*`.

---

## User Customization

Pure CSS, no JS appearance prop:

```css
/* Override tokens */
:root {
  --clerk-color-primary: light-dark(hotpink, pink);
  --clerk-radius-md: 0;
  --clerk-font-sans: 'Geist', sans-serif;
}

/* Target specific components */
.cl-button[data-variant='solid'] {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Force dark mode */
:root {
  color-scheme: dark;
}
```

---

## Agent-Readable Documentation

### Auto-generated CUSTOMIZATION.md

A build step parses `mosaic.css` and generates a `CUSTOMIZATION.md` reference that ships with the `@clerk/ui` package. This file is the single source of truth for both humans and AI agents customizing Clerk components.

**What it contains:**

1. **Decision tree** — when to use variable overrides vs class targeting vs both
2. **Full token reference** — every `--clerk-*` variable with light/dark defaults and what it controls
3. **Component reference** — every `cl-*` class, its `data-*` attributes, valid values, and examples
4. **Copy-paste recipes** — common customization tasks with ready-to-use CSS

**Example output:**

````markdown
# Clerk UI Customization Reference

## When to use what

| Goal                                      | Approach                                   |
| ----------------------------------------- | ------------------------------------------ |
| Change a color, font, or spacing globally | Override a `--clerk-*` variable on `:root` |
| Change one component's look               | Target its `.cl-*` class in your CSS       |
| Change a specific variant's style         | Target `.cl-*` + `[data-*]` selector       |
| Override dark mode values                 | Override variables inside `.theme-dark`    |

## Tokens

| Variable                      | Light                            | Dark      | Controls                            |
| ----------------------------- | -------------------------------- | --------- | ----------------------------------- |
| `--clerk-color-primary`       | `#6C47FF`                        | `#8B6FFF` | Primary buttons, links, focus rings |
| `--clerk-color-primary-hover` | `#5A38E0`                        | `#9D85FF` | Hover state for primary elements    |
| `--clerk-color-danger`        | `#EF4444`                        | `#F87171` | Error states, destructive actions   |
| `--clerk-color-bg`            | `#FFFFFF`                        | `#111111` | Page/card backgrounds               |
| `--clerk-color-fg`            | `#111111`                        | `#F0F0F0` | Primary text color                  |
| `--clerk-radius-md`           | `0.375rem`                       | —         | Default border radius               |
| `--clerk-font-sans`           | `'Inter', system-ui, sans-serif` | —         | Body font family                    |
| ...                           |                                  |           |                                     |

## Components

### Button (`.cl-button`)

| Attribute      | Values                      | Description  |
| -------------- | --------------------------- | ------------ |
| `data-variant` | `solid`, `outline`, `ghost` | Visual style |
| `data-size`    | `sm`, `md`                  | Size         |

#### Examples

⁣```css
/_ Make solid buttons rounded _/
.cl-button[data-variant='solid'] {
border-radius: 9999px;
}

/_ Custom danger button _/
.cl-button[data-variant='solid'][data-color='danger'] {
background: var(--clerk-color-danger);
}
⁣```

### Input (`.cl-input`)

...

### Select (`.cl-select`)

...
````

### Build step

The generator script reads the compiled `mosaic.css`, extracts:

- All `--clerk-*` custom property declarations and their values
- All `.cl-*` class selectors
- All `[data-*]` attribute selectors and their values
- Groups them by component

This runs as part of the build and outputs to `dist/CUSTOMIZATION.md`.

### Agent discovery

The doc ships inside the `@clerk/ui` package. Users add a one-liner to their project's `CLAUDE.md` (or equivalent):

```markdown
@node_modules/@clerk/ui/CUSTOMIZATION.md
```

This makes the full customization reference automatically available to any AI coding agent working in the project — same pattern this repo uses with `@AGENTS.md`.

### File structure update

```
packages/ui/src/mosaic/
├── tokens.css
├── Button.tsx
├── Button.module.css
├── Input.tsx
├── Input.module.css
├── Select.tsx
├── Select.module.css
├── index.ts
└── scripts/
    └── generate-customization-docs.ts   # Parses mosaic.css → CUSTOMIZATION.md
```

---

## Verification Plan

1. **Build**: `turbo build --filter=@clerk/ui` — verify `dist/mosaic.css` exists with `cl-` prefixed class names and tokens at the top
2. **Playground**: Import `@clerk/ui/mosaic.css` in the composed playground, render Button/Input/Select variants
3. **Dark mode**: Toggle `color-scheme: dark` on root — verify `light-dark()` tokens switch
4. **Customization**: Override `--clerk-color-primary` on `:root` — verify components pick up the change
5. **External targeting**: Add `.cl-button[data-variant='solid'] { text-transform: uppercase }` — verify it applies
6. **TypeScript**: Verify `styles.button` has type safety via CSS Module declaration
7. **Emotion isolation**: Verify Mosaic components don't go through Emotion's JSX factory
