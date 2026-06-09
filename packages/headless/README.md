# @clerk/headless

Headless UI primitives for Clerk's component library. These are unstyled, accessible React components built on [Floating UI](https://floating-ui.com/) that handle positioning, keyboard navigation, focus management, and ARIA attributes.

This package is **internal** (`private: true`) and consumed by `@clerk/ui`. It exists as a separate package because `@clerk/ui` uses `@emotion/react` as its JSX source, which conflicts with the standard `react-jsx` transform these primitives require.

## Primitives

| Primitive    | Import                         | Description                                                   |
| ------------ | ------------------------------ | ------------------------------------------------------------- |
| Accordion    | `@clerk/headless/accordion`    | Expandable content sections with single/multiple mode         |
| Autocomplete | `@clerk/headless/autocomplete` | Combobox input with filterable option list                    |
| Dialog       | `@clerk/headless/dialog`       | Modal dialog with focus trapping and scroll lock              |
| Menu         | `@clerk/headless/menu`         | Dropdown and nested context menus with safe hover zones       |
| Popover      | `@clerk/headless/popover`      | Non-modal floating content triggered by click                 |
| Select       | `@clerk/headless/select`       | Dropdown select with typeahead and keyboard navigation        |
| Tabs         | `@clerk/headless/tabs`         | Tab navigation with animated indicator                        |
| Tooltip      | `@clerk/headless/tooltip`      | Hover/focus tooltip with configurable delay and group support |

Shared utilities are available at `@clerk/headless/utils` (includes `renderElement` and `mergeProps`).

Each primitive has its own README in `src/primitives/<name>/` with full API docs, props tables, keyboard navigation, and data attributes.

## Usage

```tsx
import { Select } from '@clerk/headless/select';

<Select>
  <Select.Trigger>Choose...</Select.Trigger>
  <Select.Positioner>
    <Select.Popup>
      <Select.Option
        value='a'
        label='Option A'
      />
      <Select.Option
        value='b'
        label='Option B'
      />
    </Select.Popup>
  </Select.Positioner>
</Select>;
```

All primitives follow the same compound component pattern. They emit zero styles — all visual styling is applied externally via `data-cl-*` attribute selectors.

## Architecture

- **Compound components** — each primitive exports a namespace (e.g. `Select.Trigger`, `Select.Popup`) backed by per-part files so unused parts tree-shake out
- **`renderElement`** — every part uses this instead of returning JSX directly, enabling consumer `render` prop overrides and automatic state-to-data-attribute mapping
- **`data-cl-*` attributes** — structural (`data-cl-slot`), state (`data-cl-open`, `data-cl-selected`, `data-cl-active`), and animation lifecycle (`data-cl-starting-style`, `data-cl-ending-style`)
- **CSS-driven animations** — the transition system uses `data-cl-*` attributes and the Web Animations API (`getAnimations().finished`) so all timing lives in CSS
- **Floating UI** — positioning, interactions, focus management, dismiss handling, list navigation, and ARIA are all delegated to `@floating-ui/react`

## Consuming from `@clerk/ui`

`@clerk/ui` uses `jsxImportSource: '@emotion/react'`, which automatically gives every component that accepts `className: string` a working `css` prop at runtime. Headless parts already declare `className` (via `ComponentProps<Tag>`), so **the emotion `css` prop works out of the box**:

```tsx
import { Dialog } from '@clerk/headless/dialog';

<Dialog.Popup css={{ padding: 24, borderRadius: 8 }} />;
```

For Clerk's theme-aware **`sx` prop**, each part must be wrapped with `makeCustomizable` (the HOC that resolves `descriptors`/`elementId` and forwards `css={sx}` down). Create a thin wrapper module in `@clerk/ui`:

```tsx
// packages/ui/src/primitives/Dialog.tsx
import { Dialog as HeadlessDialog } from '@clerk/headless/dialog';
import type {
  DialogBackdropProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from '@clerk/headless/dialog';
import type { FunctionComponent } from 'react';
import { makeCustomizable } from '../customizables/makeCustomizable';
import type { ThemableCssProp } from '../styledSystem';

type Customizable<T> = T & { sx?: ThemableCssProp };

export const Dialog: {
  Root: FunctionComponent<DialogProps>;
  Trigger: FunctionComponent<Customizable<DialogTriggerProps>>;
  Portal: FunctionComponent<DialogPortalProps>;
  Backdrop: FunctionComponent<Customizable<DialogBackdropProps>>;
  Popup: FunctionComponent<Customizable<DialogPopupProps>>;
  Title: FunctionComponent<Customizable<DialogTitleProps>>;
  Description: FunctionComponent<Customizable<DialogDescriptionProps>>;
  Close: FunctionComponent<Customizable<DialogCloseProps>>;
} = {
  Root: HeadlessDialog.Root,
  Trigger: makeCustomizable(HeadlessDialog.Trigger),
  Portal: HeadlessDialog.Portal,
  Backdrop: makeCustomizable(HeadlessDialog.Backdrop),
  Popup: makeCustomizable(HeadlessDialog.Popup),
  Title: makeCustomizable(HeadlessDialog.Title),
  Description: makeCustomizable(HeadlessDialog.Description),
  Close: makeCustomizable(HeadlessDialog.Close),
};
```

Consumers can then style with the theme:

```tsx
<Dialog.Popup sx={t => ({ backgroundColor: t.colors.$colorBackground, padding: t.space.$6 })} />
```

### Why the explicit type annotation is required

Without the annotation, `tsc` emits **TS2742**:

> The inferred type of `Dialog` cannot be named without a reference to `@clerk/headless/dist/utils/render-element`. This is likely not portable.

`makeCustomizable<P>` returns an internal `CustomizablePrimitive<P>` type. When TS rolls up `.d.ts`, it resolves `DialogTriggerProps = ComponentProps<'button'>` back to its source file (`headless/dist/utils/render-element`), which **isn't in the package `exports` map**. The explicit `FunctionComponent<Customizable<DialogXProps>>` annotation forces TS to reference the named `DialogXProps` type from `@clerk/headless/dialog` (a public entry) instead of expanding it.

This applies to **every** headless primitive consumed through `makeCustomizable` — Popover, Tooltip, Menu, Select, etc. Each gets its own wrapper module under `packages/ui/src/primitives/<Name>.tsx` following the pattern above.

### Pass-through parts

Parts that don't render a DOM element (e.g. `Root`, `Portal`) should **not** be wrapped — pass them through directly. `makeCustomizable` only adds value for parts that render an element with a `className`.

### Skipping the wrapper

If you only need one-off styling and don't want a wrapper module, headless's `render` prop is the escape hatch:

```tsx
<HeadlessDialog.Popup render={props => <Box sx={{ ... }} {...props} />} />
```

Trade-off: verbose at the call site and loses automatic `descriptors`/`elementId` plumbing. Prefer the wrapper for any primitive used more than once.

## Development

```sh
pnpm dev          # watch mode build
pnpm build        # production build
pnpm test         # run tests (vitest + playwright browser mode)
```

Tests run in a real Chromium browser via `@vitest/browser-playwright`, not jsdom.
