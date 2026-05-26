# Mosaic: Pigment CSS Plan

## Context

Clerk's current theming uses Emotion CSS-in-JS with runtime style injection. Mosaic replaces this with Pigment CSS — a zero-runtime CSS-in-JS library that extracts colocated styles to static CSS at build time. You get the DX of writing styles in JS (like Emotion) but the output is pure CSS (like CSS Modules).

This is an exploration — new primitives only (Button, Input, Select), living alongside the existing Emotion system.

## Why Pigment CSS over CSS Modules

- **Colocated styles**: Styles live next to component logic in `.tsx` files, not separate `.module.css` files
- **Built-in variant system**: First-class `variants` array with prop matching — no manual `data-*` attribute wiring
- **Theme callbacks**: Access design tokens in style definitions via `({ theme }) => ({})` — resolved at build time, not runtime
- **Zero runtime**: Despite the JS authoring, all styles extract to static CSS at build time
- **Dual distribution**: Ship pre-extracted CSS for most consumers, raw source for advanced users who want full theme integration

## Decisions (carried over from interview + Pigment-specific changes)

| Decision                | Choice                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------- |
| CSS strategy            | Pigment CSS (zero-runtime CSS-in-JS, build-time extraction)                            |
| Scope                   | New primitives only: Button, Input, Select                                             |
| Location                | `packages/ui/src/mosaic/`                                                              |
| Token namespace         | `--clerk-*` CSS custom properties (via `extendTheme({ cssVarPrefix: 'clerk' })`)       |
| Token granularity       | Semantic only (`--clerk-color-primary-hover`, not numbered scales)                     |
| Token scoping           | `:root` (Pigment's default for `extendTheme`)                                          |
| Dark mode               | `colorSchemes` + `getSelector` for class-based toggle (`.theme-light` / `.theme-dark`) |
| Variants                | Pigment's built-in `variants` array (prop-based, extracted at build time)              |
| Component API           | `className` + `ref` forwarding (Pigment's `styled()` handles this automatically)       |
| CSS delivery (default)  | Single `import '@clerk/ui/mosaic.css'` — pre-extracted, no plugin needed               |
| CSS delivery (advanced) | Consumer uses Pigment CSS plugin + `transformLibraries` for full theme integration     |
| Emotion coexistence     | Separate `tsconfig.mosaic.json` with `jsxImportSource: "react"`                        |
| User customization      | Override `--clerk-*` CSS vars; advanced users can use Pigment's `styleOverrides`       |

---

## Distribution Model

### Default: Pre-extracted (no consumer plugin)

Clerk runs the Pigment CSS Vite plugin during its own build. The published package contains:

- Transformed JS with static class name strings (no `styled()` calls)
- Extracted `mosaic.css` with all component styles + token definitions

Consumer setup:

```tsx
// layout.tsx or _app.tsx
import '@clerk/ui/mosaic.css';

// That's it. Customize via CSS variable overrides.
```

### Advanced: Consumer-side extraction (plugin required)

For power users who want deeper customization — component slot overrides, variant injection from their theme config, etc.

Clerk ships raw source files with `styled()` calls via a separate export path. Consumer configures the Pigment CSS plugin:

```js
// next.config.mjs
import { withPigment } from '@pigment-css/nextjs-plugin';

export default withPigment(
  {},
  {
    transformLibraries: ['@clerk/ui/mosaic/source'],
    theme: {
      components: {
        ClerkButton: {
          styleOverrides: {
            root: { borderRadius: 0 },
          },
        },
      },
    },
  },
);
```

### Package exports

```json
{
  "./mosaic": "./dist/mosaic/index.js",
  "./mosaic.css": "./dist/mosaic.css",
  "./mosaic/source": "./src/mosaic/index.ts"
}
```

---

## Theme Configuration

Defined in the Vite plugin config for Clerk's own build:

```ts
// packages/ui/vite.mosaic.config.ts
import { pigment, extendTheme } from '@pigment-css/vite-plugin';

const theme = extendTheme({
  cssVarPrefix: 'clerk',
  getSelector: colorScheme => (colorScheme ? `.theme-${colorScheme}` : ':root'),
  colorSchemes: {
    light: {
      colors: {
        primary: '#6C47FF',
        primaryHover: '#5A38E0',
        primaryActive: '#4D2FBF',
        primaryMuted: '#6C47FF1A',
        primaryContrast: '#FFFFFF',
        danger: '#EF4444',
        dangerHover: '#DC2626',
        bg: '#FFFFFF',
        fg: '#111111',
        fgMuted: '#6B7280',
        surface: '#F8F8F8',
        border: '#E5E5E5',
        input: '#FFFFFF',
        ring: '#6C47FF66',
      },
    },
    dark: {
      colors: {
        primary: '#8B6FFF',
        primaryHover: '#9D85FF',
        primaryActive: '#B3A0FF',
        primaryMuted: '#8B6FFF1A',
        primaryContrast: '#FFFFFF',
        danger: '#F87171',
        dangerHover: '#FCA5A5',
        bg: '#111111',
        fg: '#F0F0F0',
        fgMuted: '#9CA3AF',
        surface: '#1A1A1A',
        border: '#333333',
        input: '#1A1A1A',
        ring: '#8B6FFF66',
      },
    },
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
  },
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  typography: {
    fontSans: "'Inter', system-ui, -apple-system, sans-serif",
    fontMono: "'Fira Code', ui-monospace, monospace",
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.8125rem',
    fontSizeMd: '0.875rem',
    fontSizeLg: '1rem',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
  },
});
```

This generates CSS variables at `:root` with class-based dark mode:

```css
:root {
  --clerk-colors-primary: #6C47FF;
  --clerk-colors-primaryHover: #5A38E0;
  --clerk-spacing-1: 0.25rem;
  --clerk-radii-md: 0.375rem;
  --clerk-typography-fontSans: 'Inter', system-ui, ...;
}

.theme-dark {
  --clerk-colors-primary: #8B6FFF;
  --clerk-colors-primaryHover: #9D85FF;
  ...
}
```

Users toggle dark mode programmatically:

```js
document.documentElement.classList.add('theme-dark');
```

---

## Component Pattern

### Button

```tsx
// packages/ui/src/mosaic/Button.tsx
/** @jsxImportSource react */
import { styled } from '@pigment-css/react';

interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

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
    // Size variants
    {
      props: { size: 'sm' },
      style: {
        padding: `${theme.vars.spacing[1]} ${theme.vars.spacing[2]}`,
        fontSize: theme.vars.typography.fontSizeXs,
      },
    },
    {
      props: { size: 'md' },
      style: {
        padding: `${theme.vars.spacing[2]} ${theme.vars.spacing[4]}`,
        fontSize: theme.vars.typography.fontSizeSm,
      },
    },

    // Visual variants
    {
      props: { variant: 'solid' },
      style: {
        background: theme.vars.colors.primary,
        color: theme.vars.colors.primaryContrast,
        '&:hover': { background: theme.vars.colors.primaryHover },
        '&:active': { background: theme.vars.colors.primaryActive },
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
    {
      props: { variant: 'ghost' },
      style: {
        background: 'transparent',
        color: theme.vars.colors.fg,
        '&:hover': { background: theme.vars.colors.surface },
      },
    },
  ],
}));

Button.defaultProps = {
  variant: 'solid',
  size: 'md',
};
```

### Input

```tsx
// packages/ui/src/mosaic/Input.tsx
/** @jsxImportSource react */
import { styled } from '@pigment-css/react';

export const Input = styled('input', {
  name: 'ClerkInput',
  slot: 'root',
})(({ theme }) => ({
  display: 'block',
  width: '100%',
  padding: `${theme.vars.spacing[2]} ${theme.vars.spacing[3]}`,
  fontFamily: theme.vars.typography.fontSans,
  fontSize: theme.vars.typography.fontSizeSm,
  color: theme.vars.colors.fg,
  backgroundColor: theme.vars.colors.input,
  border: `1px solid ${theme.vars.colors.border}`,
  borderRadius: theme.vars.radii.md,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',

  '&::placeholder': {
    color: theme.vars.colors.fgMuted,
  },
  '&:focus': {
    borderColor: theme.vars.colors.primary,
    boxShadow: `0 0 0 1px ${theme.vars.colors.ring}`,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));
```

### Select

```tsx
// packages/ui/src/mosaic/Select.tsx
/** @jsxImportSource react */
import { styled } from '@pigment-css/react';

export const Select = styled('select', {
  name: 'ClerkSelect',
  slot: 'root',
})(({ theme }) => ({
  display: 'block',
  width: '100%',
  padding: `${theme.vars.spacing[2]} ${theme.vars.spacing[3]}`,
  fontFamily: theme.vars.typography.fontSans,
  fontSize: theme.vars.typography.fontSizeSm,
  color: theme.vars.colors.fg,
  backgroundColor: theme.vars.colors.input,
  border: `1px solid ${theme.vars.colors.border}`,
  borderRadius: theme.vars.radii.md,
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.15s, box-shadow 0.15s',

  '&:focus': {
    borderColor: theme.vars.colors.primary,
    boxShadow: `0 0 0 1px ${theme.vars.colors.ring}`,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));
```

---

## File Structure

```
packages/ui/src/mosaic/
├── Button.tsx              # Button (styled component + variants)
├── Input.tsx               # Input (styled component)
├── Select.tsx              # Select (styled component)
├── index.ts                # Public exports
├── theme.ts                # Theme definition (used by build config)
├── theme.d.ts              # TypeScript theme augmentation
└── MOSAIC_PLAN_PIGMENT_CSS.md
```

---

## Build Pipeline

### New Vite config for Mosaic extraction

```ts
// packages/ui/vite.mosaic.config.ts
import { defineConfig } from 'vite';
import { pigment } from '@pigment-css/vite-plugin';
import { theme } from './src/mosaic/theme';

export default defineConfig({
  plugins: [pigment({ theme })],
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

### Package.json additions

```json
{
  "scripts": {
    "build:mosaic": "vite build --config vite.mosaic.config.ts"
  },
  "exports": {
    "./mosaic": "./dist/mosaic/index.js",
    "./mosaic.css": "./dist/mosaic/style.css",
    "./mosaic/source": {
      "types": "./src/mosaic/index.ts",
      "default": "./src/mosaic/index.ts"
    }
  }
}
```

### Emotion coexistence

`tsconfig.mosaic.json` extends base config, overrides `jsxImportSource` to `"react"`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsxImportSource": "react"
  },
  "include": ["src/mosaic/**/*"]
}
```

Note: The `/** @jsxImportSource react */` pragma in each file also handles this per-file.

### Dependencies to add

```json
{
  "dependencies": {
    "@pigment-css/react": "^0.0.31"
  },
  "devDependencies": {
    "@pigment-css/vite-plugin": "^0.0.31"
  }
}
```

---

## User Customization

### Default path (CSS variable overrides)

```css
/* User's global CSS */
:root {
  --clerk-colors-primary: hotpink;
  --clerk-radii-md: 0;
  --clerk-typography-fontSans: 'Geist', sans-serif;
}
```

```js
/* Toggle dark mode */
document.documentElement.classList.add('theme-dark');
```

### Advanced path (Pigment plugin + styleOverrides)

```js
// next.config.mjs
export default withPigment(
  {},
  {
    transformLibraries: ['@clerk/ui/mosaic/source'],
    theme: {
      components: {
        ClerkButton: {
          styleOverrides: {
            root: {
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          },
        },
      },
    },
  },
);
```

---

## Risks & Considerations

| Risk                                                                   | Mitigation                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pigment CSS is v0.0.31 (alpha)                                         | Pin exact version. This is exploration, not production. Evaluate stability before committing.                                  |
| Build-time extraction adds complexity                                  | Separate Vite config isolates Mosaic build from existing tsdown pipeline                                                       |
| `@pigment-css/react` becomes a runtime dependency                      | It's lightweight when pre-extracted (just type definitions). Verify bundle impact.                                             |
| Consumer-side `transformLibraries` DX                                  | Default path requires zero config. Advanced path is opt-in and documented.                                                     |
| Emotion + Pigment CSS in same package                                  | Separate tsconfig + JSX pragma prevents conflicts. Different source directories.                                               |
| `extendTheme` variable naming may not produce exact `--clerk-*` format | Test that `cssVarPrefix: 'clerk'` + nested theme keys produce the desired variable names. May need to flatten theme structure. |

---

## Verification Plan

1. **Build**: Run `pnpm build:mosaic` — verify extracted CSS in `dist/mosaic/style.css` with `--clerk-*` variables
2. **Playground**: Import `@clerk/ui/mosaic.css` in composed playground, render Button/Input/Select variants
3. **Dark mode**: Add `.theme-dark` class to root — verify variables switch via `getSelector` config
4. **CSS var override**: Set `--clerk-colors-primary` on `:root` — verify components update
5. **Variant resolution**: Render `<Button variant="outline" size="sm" />` — verify correct extracted styles apply
6. **className forwarding**: Pass custom `className` to components — verify it merges correctly
7. **Emotion isolation**: Verify Mosaic components don't use Emotion's JSX factory
8. **Bundle size**: Compare `mosaic.css` size to equivalent Emotion runtime
9. **Advanced path**: Test `transformLibraries` with a Next.js consumer app and `styleOverrides`
