# DX Guide: Mosaic — CSS Modules Design System

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

## Proposal

Replace the Emotion-based appearance cascade with a new set of primitive components ("Mosaic") that use **CSS Modules** for styling and **CSS custom properties** for theming. The result: components ship as a static CSS file that users import once (`import '@clerk/ui/mosaic.css'`), customize with plain CSS variable overrides, and target with stable `cl-*` class names. No JavaScript styling API, no runtime style computation, no appearance cascade.

This eliminates the 6,400-line theming infrastructure, the 3-HOC wrapper chain, the 7-step class generation pipeline, and the runtime color scale computation. For customers, customization becomes "write CSS" — the most universal, stable, and agent-friendly interface available. For Clerk developers, adding a new component means writing a `.tsx` file and a `.module.css` file — two files, zero registries, zero HOCs.

### Developer Flows

#### Importing styles (customer)

```tsx
// layout.tsx — one import, done for the lifetime of the app
import '@clerk/ui/mosaic.css';
```

This single import delivers all component styles and design token definitions. No `<ClerkProvider>` appearance prop, no theme objects, no `@clerk/themes` package.

#### Customizing colors, fonts, spacing (customer)

Override CSS custom properties on `:root`. This is plain CSS — it works in any `.css` file, any `<style>` tag, any CSS-in-JS library the customer already uses.

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

Every Clerk component picks up the new values automatically — buttons, inputs, selects, and any future components. No per-component configuration needed.

#### Customizing a specific component (customer)

Target elements using their `data-cl-slot` attribute:

```css
/* Make solid buttons uppercase with wider letter spacing */
[data-cl-slot='button-root'][data-variant='solid'] {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Style the button's icon slot */
[data-cl-slot='button-icon'] {
  width: 1em;
  height: 1em;
}

/* Remove border radius from inputs */
[data-cl-slot='input-root'] {
  border-radius: 0;
}

/* Add a custom outline to focused selects */
[data-cl-slot='select-root']:focus {
  outline: 3px solid var(--clerk-color-primary);
  outline-offset: 2px;
}
```

Every element exposes a `data-cl-slot` attribute — the stable, public API for targeting. Slot names are visible in browser DevTools, self-documenting, and discoverable by inspecting the DOM. Class names remain internal (CSS Module scoped) and are not part of the public contract.

#### Dark mode (customer)

Mosaic uses `light-dark()` for all color tokens. Dark mode follows the user's OS preference by default. To force a specific mode:

```css
/* Force dark mode */
:root {
  color-scheme: dark;
}

/* Force light mode */
:root {
  color-scheme: light;
}
```

Override specific dark mode colors:

```css
:root {
  --clerk-color-primary: light-dark(#e63946, #ff6b6b);
  --clerk-color-bg: light-dark(#ffffff, #0a0a0a);
}
```

#### `@property` registered tokens (advanced)

Color tokens can be registered with `@property`, enabling use cases that are impossible with unregistered custom properties — like animating gradients or using tokens in `color-mix()` with type safety:

```css
@property --clerk-color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #6c47ff;
}

@property --clerk-color-ring {
  syntax: '<color>';
  inherits: true;
  initial-value: #6c47ff66;
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

`@property` also provides browser-level type checking (invalid values are rejected and fall back to `initial-value`) and explicit inheritance control — features only available when writing real CSS.

#### Agent-driven customization

A `CUSTOMIZATION.md` reference ships with the `@clerk/ui` package, auto-generated from the CSS at build time. It contains every token, every component class, every data attribute, and copy-paste examples.

Users add one line to their project's `CLAUDE.md` to make the entire reference available to AI coding agents:

```markdown
@node_modules/@clerk/ui/CUSTOMIZATION.md
```

An agent customizing Clerk components needs to know:

| Goal                             | What to do                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| Change a color, font, or spacing | Override a `--clerk-*` variable on `:root`                    |
| Change one component's look      | Target `[data-cl-slot='component-root']` in CSS               |
| Change a specific variant        | Target `[data-cl-slot='...'][data-variant='...']` selector    |
| Change a sub-element             | Target `[data-cl-slot='component-icon']` (each slot is named) |
| Override dark mode values        | Use `light-dark()` in the variable value                      |

This is plain CSS with attribute selectors — the most universally understood language by AI models. Slots are visible in DevTools and self-documenting.

#### Adding a new Mosaic component (Clerk developer)

Two files. No registries, no HOCs, no type synchronization.

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

That's it. No `APPEARANCE_KEYS` registry. No `ElementsConfig` type entry. No `makeCustomizable` HOC. No `createVariants` config. No `elementDescriptor` prop. The component is a React component. The styles are CSS. The `data-cl-slot` attributes are the public API — stable, inspectable, self-documenting.

#### Current vs. Mosaic: side-by-side

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

---

## Rollout Plan

### Phase 1: Foundation (exploration)

- Create `packages/ui/src/mosaic/` with token definitions (`tokens.css`) and build pipeline (CSS Modules plugin, `generateScopedName` for `cl-*` prefixing)
- Build the initial three components: Button, Input, Select
- Wire up the `playground/composed` app to render Mosaic components alongside existing composed components
- Validate: dark mode toggle, CSS variable overrides, `className` forwarding, variant resolution

### Phase 2: Validation

- Expand the component set based on what the composed API surface needs (Spinner, Badge, Alert, etc.)
- Build the `CUSTOMIZATION.md` auto-generation script
- Test with a real Next.js consumer app — verify the `import '@clerk/ui/mosaic.css'` path works end-to-end
- Gather feedback from the team on the authoring experience

### Phase 3: Composed API integration

- Wire Mosaic primitives into the composed `UserProfile` and `OrganizationProfile` components
- Evaluate whether the component injection plan (`COMPONENT_INJECTION.md`) should use Mosaic as the default primitive set
- Assess whether the existing appearance cascade can be sunset for composed-mode consumers

### Phase 4: Migration path

- Document the migration guide for customers moving from `appearance` prop to CSS variable overrides
- Provide a compatibility layer or codemod if feasible (e.g., convert `appearance.variables.colorPrimary` to `--clerk-color-primary` CSS declarations)
- Plan deprecation timeline for the Emotion-based appearance system

---

## Abandoned or Deferred Ideas

### Pigment CSS (zero-runtime CSS-in-JS)

We evaluated Pigment CSS (MUI's build-time CSS-in-JS extraction library) as an alternative to CSS Modules. It offers colocated styles in JS (familiar to the team) and a built-in variant system, with build-time extraction to static CSS.

**Why we deferred it:**

- Pigment CSS is v0.0.31 (alpha) with no stability guarantees — a risky foundation for a design system
- Its JS object syntax cannot express modern CSS features like `@property`, `@layer`, `@scope`, or `@starting-style` without escape hatches — meaning we'd still be constrained by a translation layer
- The advanced customization path (consumer-side `transformLibraries` + plugin) adds significant setup friction
- CSS Modules achieve the same output (static CSS, zero runtime) with no new dependencies and full access to the CSS language

A detailed comparison is documented in `MOSAIC_COMPARISON.md`.

### Keeping the `appearance` prop alongside CSS variables

We considered maintaining a JavaScript `appearance` prop that would set CSS variables under the hood — a bridge for customers already using the current API. We deferred this because:

- It adds a JS-to-CSS translation layer that re-introduces the complexity we're trying to remove
- CSS variables are strictly more universal — they work in JS frameworks, plain HTML, server components, and with AI agents
- A codemod that converts `appearance.variables` to CSS declarations is a simpler migration path

### Tailwind CSS v4

We evaluated Tailwind CSS v4 as a primary styling approach. v4's shift to CSS-first configuration (`@theme` replaces `tailwind.config.js`) and native CSS custom property output made it worth serious consideration — especially since many Clerk consumers already use Tailwind.

**What v4 offers:**

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

A detailed plan and comparison is documented in `MOSAIC_PLAN_TAILWIND.md`.

---

## Speculative Changelog Post

### Introducing Mosaic: Clerk's new CSS-based design system

**TL;DR:** Clerk components now ship as a static CSS file. Customize with CSS variables. No JavaScript API needed.

We've rebuilt Clerk's component styling from the ground up. The new system, Mosaic, replaces our runtime CSS-in-JS theming with plain CSS — static stylesheets, CSS custom properties, and stable class names.

**What's new:**

- **One CSS import**: Add `import '@clerk/ui/mosaic.css'` to your app. That's the entire setup.
- **CSS variable customization**: Override `--clerk-color-primary`, `--clerk-font-sans`, `--clerk-radius-md` and dozens of other tokens on `:root`. Every Clerk component updates automatically.
- **Stable slot attributes**: Target `[data-cl-slot='button-root']`, `[data-cl-slot='input-root']` with your own CSS. Use `data-variant` and `data-size` attributes for variant-specific overrides. Every styleable element has a named slot visible in DevTools.
- **Dark mode built in**: Colors use `light-dark()` and follow your OS preference. Force a mode with `color-scheme: dark`.
- **Modern CSS features**: Full access to `@property` (type-safe tokens, animatable gradients), `@layer`, `@container`, native nesting, and every future CSS feature — no library intermediary.
- **Agent-friendly**: A `CUSTOMIZATION.md` reference ships with the package. Add one line to your `CLAUDE.md` and any AI coding agent can customize Clerk components.

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

Prebuilt themes (`dark`, `shadcn`, `neobrutalism`, `shadesOfPurple`) are JavaScript objects designed for the `appearance` prop. They don't apply to Mosaic components. Equivalent Mosaic themes would be plain CSS files that override `--clerk-*` variables — potentially shipped from the same package or as CSS snippets in documentation.

### `clerk-js` CDN bundle

The Rspack UMD build (`ui.browser.js`) bundles Emotion and the full theming infrastructure. Mosaic components would need a separate entry point or a migration of the CDN bundle to include the static CSS.

### Existing customers

No breaking change. The `appearance` prop and Emotion-based components continue to work. Mosaic is additive — customers opt in by importing `mosaic.css` and using Mosaic components. Migration is at their pace.

### Documentation

The `appearance` prop documentation is extensive. Mosaic documentation is simpler (CSS variable reference + class name reference) but needs to be written. The auto-generated `CUSTOMIZATION.md` covers the technical reference; guides and tutorials need separate authoring.

### Component injection (`COMPONENT_INJECTION.md`)

Mosaic primitives are natural candidates for the default component set in the injection system. Their API (standard HTML attributes + `data-*` variants + `className` forwarding) aligns with the injection plan's requirement for components that accept standard HTML attributes.
