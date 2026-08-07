# Clerk UI Theming Architecture

## Overview

Clerk's theming system lets users customize every visual aspect of Clerk components — from broad design tokens (colors, fonts, spacing) down to individual element styles. It's built on a layered cascade model, processed through a parsing pipeline, and rendered via Emotion CSS-in-JS.

---

## How Users Configure Themes

Users pass an `appearance` prop to `<ClerkProvider>` (global) or directly to individual components like `<SignIn>`.

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

<ClerkProvider
  appearance={{
    // 1. Prebuilt theme (optional base)
    theme: dark,

    // 2. Design tokens — colors, fonts, spacing, radii
    variables: {
      colorPrimary: '#6C47FF',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
    },

    // 3. Per-element CSS overrides (static object or function)
    elements: {
      card: { boxShadow: 'none' },
      formButtonPrimary: {
        backgroundColor: '#6C47FF',
        '&:hover': { backgroundColor: '#5A38E0' },
      },
    },

    // 4. Per-component overrides
    signIn: {
      variables: { colorPrimary: 'red' },
      elements: { headerTitle: { color: 'red' } },
    },
  }}
/>;
```

### The `Theme` Object

Every `appearance` prop is a `Theme` with these keys:

| Key         | Purpose                                                            |
| ----------- | ------------------------------------------------------------------ |
| `theme`     | A prebuilt theme (or array of themes) to use as the starting point |
| `variables` | High-level design tokens (colors, fonts, spacing, radii, shadows)  |
| `elements`  | Per-element CSS overrides using element descriptor keys            |
| `options`   | Layout options (logo placement, social button position, etc.)      |
| `captcha`   | CAPTCHA widget appearance                                          |

### The `Appearance` Object

`Appearance` extends `Theme` with per-component override keys:

```
Appearance = Theme & {
  signIn?: Theme
  signUp?: Theme
  userButton?: Theme
  userProfile?: Theme
  organizationSwitcher?: Theme
  organizationProfile?: Theme
  // ... every Clerk component has a key
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER CONFIGURATION                           │
│                                                                     │
│  ClerkProvider                        <SignIn />                     │
│  appearance={                         appearance={                   │
│    theme: dark,          ───┐           variables: {...},            │
│    variables: {...},        │           elements: {...},             │
│    elements: {...},         │         }                              │
│    signIn: {...},           │              │                         │
│  }                          │              │                         │
│         │                   │              │                         │
└─────────┼───────────────────┼──────────────┼────────────────────────┘
          │                   │              │
          ▼                   ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPEARANCE PROVIDER                              │
│                                                                     │
│  AppearanceProvider receives three inputs:                           │
│    • globalAppearance    (from ClerkProvider)                        │
│    • appearanceKey       ("signIn", "userButton", etc.)              │
│    • componentAppearance (from the component's own prop)             │
│                                                                     │
│  Calls parseAppearance() to resolve everything ─────────────────┐   │
│                                                                 │   │
└─────────────────────────────────────────────────────────────────┼───┘
                                                                  │
          ┌───────────────────────────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PARSE APPEARANCE PIPELINE                      │
│  packages/ui/src/customizables/parseAppearance.ts                   │
│                                                                     │
│  Step 1: BUILD THE CASCADE                                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Ordered list (lowest → highest priority):                │       │
│  │                                                          │       │
│  │  ① baseTheme (clerkTheme)  ← default Clerk styling      │       │
│  │  ② globalAppearance        ← ClerkProvider appearance    │       │
│  │  ③ globalAppearance[key]   ← e.g. appearance.signIn     │       │
│  │  ④ componentAppearance     ← <SignIn appearance={...} /> │       │
│  │                                                          │       │
│  │  Each layer's `theme` property is recursively expanded   │       │
│  │  (depth-first). E.g. theme: [dark, custom] expands to   │       │
│  │  [dark, custom, parentTheme].                            │       │
│  │                                                          │       │
│  │  If any layer sets simpleStyles: true, the baseTheme     │       │
│  │  is excluded (used by neobrutalism theme).               │       │
│  └──────────────────────────────────────────────────────────┘       │
│                          │                                          │
│          ┌───────────────┼───────────────┐                          │
│          ▼               ▼               ▼                          │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐                  │
│  │ Step 2a:     │ │ Step 2b:    │ │ Step 2c:    │                  │
│  │ PARSE        │ │ PARSE       │ │ PARSE       │                  │
│  │ VARIABLES    │ │ ELEMENTS    │ │ OPTIONS     │                  │
│  └──────┬───────┘ └──────┬──────┘ └──────┬──────┘                  │
│         │                │               │                          │
│         ▼                ▼               ▼                          │
│  parsedInternal-   parsedElements   parsedOptions                   │
│  Theme             (Elements[])     (layout config)                 │
│                                                                     │
│  Output: { parsedInternalTheme, parsedElements, parsedOptions }     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Variable Resolution: From Tokens to Styles

When a user sets `variables.colorPrimary: '#6C47FF'`, here's what happens:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VARIABLE PARSING PIPELINE                        │
│  packages/ui/src/customizables/parseVariables.ts                    │
│                                                                     │
│  variables.colorPrimary: '#6C47FF'                                  │
│         │                                                           │
│         ▼                                                           │
│  createColorScales()                                                │
│    ├─ Generates 15-shade lightness scale (25–950)                   │
│    │  using color-mix() or HSL manipulation                         │
│    ├─ Generates 15-shade alpha scale                                │
│    └─ Output:                                                       │
│         $primaryColor25:  'color-mix(in srgb, #6C47FF, white 92%)' │
│         $primaryColor50:  'color-mix(in srgb, #6C47FF, white 85%)' │
│         $primaryColor100: 'color-mix(in srgb, #6C47FF, white 73%)' │
│         ...                                                         │
│         $primaryColor500: '#6C47FF'    ← the base shade             │
│         ...                                                         │
│         $primaryColor950: 'color-mix(in srgb, #6C47FF, black 70%)' │
│                                                                     │
│  Similarly for other variable categories:                           │
│    createRadiiUnits()     → $radius1, $radius2, ...                 │
│    createSpaceScale()     → $space1, $space2, ...                   │
│    createFontSizeScale()  → $fontSizeXs, $fontSizeSm, ...          │
│    createFontWeightScale()→ $fontWeightNormal, $fontWeightBold, ... │
│    createFonts()          → $fontFamily, $fontFamilyButtons           │
│    createShadowsUnits()   → $cardContentShadow, $input, ...        │
│                                                                     │
│  All scales deep-merged onto defaultInternalTheme                   │
│         │                                                           │
│         ▼                                                           │
│  parsedInternalTheme (InternalTheme)                                │
│  ┌──────────────────────────────────────┐                           │
│  │ {                                    │                           │
│  │   colors: {                          │                           │
│  │     $primaryColor500: '#6C47FF',     │                           │
│  │     $primaryColor600: '...',         │                           │
│  │     $dangerColor500: '#EF4444',      │                           │
│  │     $neutralAlpha100: '...',         │                           │
│  │     $colorBackground: '...',         │                           │
│  │     ...                              │                           │
│  │   },                                 │                           │
│  │   radii: { $radius1: '...', ... },   │                           │
│  │   space: { $space1: '...', ... },    │                           │
│  │   fonts: { $fontFamily: '...' },     │                           │
│  │   fontSizes: { ... },                │                           │
│  │   fontWeights: { ... },              │                           │
│  │   shadows: { ... },                  │                           │
│  │ }                                    │                           │
│  └──────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Default Values and CSS Variables

The foundation layer (`packages/ui/src/foundations/`) defines every default token using `--clerk-*` CSS variables with hardcoded fallbacks:

```
colorBackground: var(--clerk-color-background, #ffffff)
colorPrimary:    var(--clerk-color-primary, #2F3037)
fontSize:        var(--clerk-font-size, 0.8125rem)
borderRadius:    var(--clerk-border-radius, 0.375rem)
spacing:         calc(var(--clerk-spacing, 1rem) * N)
```

This creates **two override paths**:

1. **CSS-only**: Set `--clerk-color-primary: hotpink` on any parent element — works without JS
2. **JS (appearance prop)**: Pass `variables.colorPrimary` — the parsed values override the CSS variable fallbacks via Emotion's inline styles

---

## How Styles Reach Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVIDER TREE (per component)                    │
│                                                                     │
│  StyleCacheProvider         ← Emotion cache (key: 'cl-internal')   │
│    │                          Optional @layer wrapping              │
│    └─ AppearanceProvider    ← Holds parsed theme + elements        │
│         │                                                           │
│         └─ InternalThemeProvider  ← Emotion ThemeProvider           │
│              │                      (theme = parsedInternalTheme)   │
│              │                                                      │
│              └─ Component Tree                                      │
│                   │                                                 │
│                   ├─ <Button sx={t => ({ bg: t.colors.$primary })} │
│                   ├─ <Input elementDescriptor={descriptors.input} />│
│                   └─ <Card elementDescriptor={descriptors.card} />  │
└─────────────────────────────────────────────────────────────────────┘
```

### The `makeCustomizable` HOC

Every primitive component (Button, Input, Box, etc.) is wrapped with `makeCustomizable()`. This is the bridge between user-defined element styles and rendered output.

```
┌─────────────────────────────────────────────────────────────────────┐
│  makeCustomizable(Button)                                           │
│  packages/ui/src/customizables/makeCustomizable.tsx                 │
│                                                                     │
│  Props received:                                                    │
│    elementDescriptor = descriptors.formButtonPrimary                │
│    elementId = undefined (or a specific id like "google")           │
│    sx = (theme) => ({ ... })   ← component's own styles            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  1. Pull parsedElements from AppearanceContext             │      │
│  │                                                            │      │
│  │  2. generateClassName(parsedElements, descriptors, id)     │      │
│  │     ├─ Produces classnames: "cl-formButtonPrimary"         │      │
│  │     │  (for external CSS targeting by users)               │      │
│  │     │                                                      │      │
│  │     └─ Collects matching CSS objects from parsedElements   │      │
│  │        Each layer that has a "formButtonPrimary" key        │      │
│  │        contributes its styles.                             │      │
│  │        State variants (loading/error) get specificity      │      │
│  │        wrappers: { '&&': styleObj }                        │      │
│  │                                                            │      │
│  │  3. Merge into final css array:                            │      │
│  │     css = [                                                │      │
│  │       defaultStyles,      ← makeCustomizable defaults      │      │
│  │       sx,                 ← component's own styles         │      │
│  │       ...elemStyles,      ← user's element overrides       │      │
│  │     ]                     (last wins in Emotion)           │      │
│  │                                                            │      │
│  │  4. Render:                                                │      │
│  │     <Button                                                │      │
│  │       className="cl-formButtonPrimary"                     │      │
│  │       css={[defaultStyles, sx, ...elemStyles]}             │      │
│  │     />                                                     │      │
│  └───────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Element Descriptors and Targeting

Every styleable element has a **descriptor** that generates `cl-*` classnames:

```
elementDescriptor = descriptors.formButtonPrimary

Generates:
  classname: "cl-formButtonPrimary"
  with id:   "cl-formButtonPrimary__google"
  with state:"cl-formButtonPrimary__loading"
```

Users target these in the `elements` object:

```tsx
elements: {
  // Base element
  formButtonPrimary: { backgroundColor: 'blue' },

  // With state
  formButtonPrimary__loading: { opacity: 0.5 },

  // With id
  socialButtonsIconButton__google: { borderColor: 'red' },

  // CSS string (adds as className)
  card: 'my-custom-card-class',
}
```

The `elements` value can also be a **function** that receives the resolved theme:

```tsx
elements: theme => ({
  formButtonPrimary: {
    backgroundColor: theme.colors.$primaryColor500,
    borderRadius: theme.radii.$radius2,
  },
});
```

---

## Prebuilt Themes

Exported from `@clerk/themes`:

| Theme            | Strategy                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `dark`           | Overrides `variables` with dark backgrounds and light neutrals                                                    |
| `shadesOfPurple` | Chains `theme: dark`, then adds purple overrides                                                                  |
| `neobrutalism`   | Uses `simpleStyles: true` to bypass the default `baseTheme`, applies heavy border/shadow overrides via `elements` |
| `shadcn`         | Maps Clerk variables to shadcn CSS custom properties (`var(--primary)`, etc.), uses `cssLayerName: 'components'`  |

Themes can be **composed** since `theme` accepts an array:

```tsx
appearance={{
  theme: [dark, myCustomTheme],  // dark applied first, then custom
  variables: { ... },             // applied on top of both
}}
```

---

## CSS Layer Support

Users can isolate Clerk's styles in a CSS cascade layer:

```tsx
appearance={{ cssLayerName: 'clerk' }}
```

The `StyleCacheProvider` wraps all emitted Emotion styles in `@layer clerk { ... }`, giving consumers full control over cascade ordering.

---

## Complete Data Flow Summary

```
User writes:                     ClerkProvider appearance + Component appearance
                                              │
                                              ▼
                                    AppearanceProvider
                                              │
                                              ▼
                                    parseAppearance()
                                ┌─────────────┼──────────────┐
                                │             │              │
                                ▼             ▼              ▼
                          parseVariables  parseElements  parseOptions
                                │             │              │
                                ▼             │              │
                     ┌──────────────────┐     │              │
                     │ Scale generation │     │              │
                     │ (colors, radii,  │     │              │
                     │  space, fonts,   │     │              │
                     │  shadows)        │     │              │
                     └────────┬─────────┘     │              │
                              │               │              │
                              ▼               ▼              ▼
                     parsedInternalTheme  ParsedElements  ParsedOptions
                              │               │
                     ┌────────┘               │
                     ▼                        │
              Emotion ThemeProvider            │
              (accessible via useTheme()      │
               and sx prop functions)         │
                     │                        │
                     │    ┌───────────────────┘
                     │    │
                     ▼    ▼
              makeCustomizable(Component)
                     │
                     ├─ Resolves defaultStyles + sx using InternalTheme
                     ├─ Looks up element overrides from ParsedElements
                     ├─ Generates cl-* classnames for external targeting
                     └─ Merges everything into Emotion css prop
                              │
                              ▼
                     Emotion injects <style> tags
                     into the cl-internal cache
                     (optionally inside @layer)
                              │
                              ▼
                        Rendered DOM
```

## Key Files Reference

| File                                                     | Purpose                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/ui/src/internal/appearance.ts`                 | Public types: `Theme`, `Appearance`, `Variables`, `Elements`, `Options`      |
| `packages/ui/src/customizables/parseAppearance.ts`       | Central parsing engine — builds cascade, calls all parsers                   |
| `packages/ui/src/customizables/parseVariables.ts`        | Converts `Variables` into `InternalTheme` (color scales, radii, space, etc.) |
| `packages/ui/src/customizables/AppearanceContext.tsx`    | React context provider — holds parsed theme and elements                     |
| `packages/ui/src/customizables/makeCustomizable.tsx`     | HOC that bridges parsed appearance to rendered components                    |
| `packages/ui/src/customizables/classGeneration.ts`       | Generates `cl-*` classnames and collects element CSS                         |
| `packages/ui/src/customizables/elementDescriptors.ts`    | Defines all element keys and the `cl-` class prefix                          |
| `packages/ui/src/styledSystem/InternalThemeProvider.tsx` | Wraps Emotion's `ThemeProvider` with the parsed theme                        |
| `packages/ui/src/styledSystem/StyleCacheProvider.tsx`    | Emotion cache with `@layer` support                                          |
| `packages/ui/src/foundations/`                           | Default token values (colors, typography, sizes, shadows)                    |
| `packages/ui/src/baseTheme.ts`                           | Default Clerk styling (shadows, borders, complex compositions)               |
| `packages/ui/src/themes/`                                | Prebuilt themes (`dark`, `shadcn`, `neobrutalism`, `shadesOfPurple`)         |
| `packages/ui/src/utils/cssVariables.ts`                  | `clerkCssVar()` helper for `var(--clerk-*)` generation                       |
| `packages/ui/src/utils/colors/scales.ts`                 | Color scale generation (lightness + alpha)                                   |
