# Primitives

Headless UI primitives for `@clerk/mosaic`. These are unstyled, accessible React components built on [Floating UI](https://floating-ui.com/) that handle positioning, keyboard navigation, focus management, and ARIA attributes.

This is an internal folder (`src/primitives/`) inside `@clerk/mosaic`, not a separate package. Mosaic's styled `src/components/*` import these primitives via relative paths (`../../primitives/<name>`); there is no public subpath export for them, so nothing outside `@clerk/mosaic` can import a primitive today.

## Primitives

| Primitive    | Location                      | Description                                                   |
| ------------ | ----------------------------- | ------------------------------------------------------------- |
| Accordion    | `src/primitives/accordion`    | Expandable content sections with single/multiple mode         |
| Autocomplete | `src/primitives/autocomplete` | Combobox input with filterable option list                    |
| Dialog       | `src/primitives/dialog`       | Modal dialog with focus trapping and scroll lock              |
| FileUpload   | `src/primitives/file-upload`  | File picker + drag-and-drop upload with image previews        |
| Menu         | `src/primitives/menu`         | Dropdown and nested context menus with safe hover zones       |
| OTP          | `src/primitives/otp`          | One-time-password / PIN input split into per-character slots  |
| Popover      | `src/primitives/popover`      | Non-modal floating content triggered by click                 |
| Select       | `src/primitives/select`       | Dropdown select with typeahead and keyboard navigation        |
| Tabs         | `src/primitives/tabs`         | Tab navigation with animated indicator                        |
| Toast        | `src/primitives/toast`        | Stacked notifications with timers, a queue, and announcements |
| Tooltip      | `src/primitives/tooltip`      | Hover/focus tooltip with configurable delay and group support |

Shared utilities live at `src/primitives/utils` (includes `useRender` and `mergeProps`).

Each primitive has its own README in `src/primitives/<name>/` with full API docs, props tables, keyboard navigation, and data attributes.

## Usage

```tsx
import { Select } from '../../primitives/select';

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

All primitives follow the same compound component pattern. They emit zero styles — all visual styling is applied externally via `data-*` attribute selectors.

## Architecture

- **Compound components** — each primitive exports a namespace (e.g. `Select.Trigger`, `Select.Popup`) backed by per-part files so unused parts tree-shake out
- **`useRender`** — every part that renders a DOM element calls this hook instead of returning JSX directly, enabling consumer `render` prop overrides (function or element) and automatic state-to-data-attribute mapping
- **`data-*` attributes** — state (`data-open`, `data-selected`, `data-active`) and animation lifecycle (`data-starting-style`, `data-ending-style`); parts are targeted by consumer-supplied classNames, not by an emitted slot attribute
- **CSS-driven animations** — the transition system uses `data-*` attributes and the Web Animations API (`getAnimations().finished`) so all timing lives in CSS
- **Floating UI** — positioning, interactions, focus management, dismiss handling, list navigation, and ARIA are all delegated to `@floating-ui/react`

## Consuming from `@clerk/ui`

`@clerk/ui` does not import these primitives today — `@clerk/mosaic` has no public subpath export for them (only the `.` and `./styles.css` entries in its `exports` map). This section documents the pattern for when that becomes needed, once a `@clerk/mosaic/<primitive>` subpath export is added.

`@clerk/ui` uses `jsxImportSource: '@emotion/react'`, which automatically gives every component that accepts `className: string` a working `css` prop at runtime. Primitive parts already declare `className` (via `ComponentProps<Tag>`), so **the emotion `css` prop works out of the box**:

```tsx
import { Dialog } from '@clerk/mosaic/dialog';

<Dialog.Popup css={{ padding: 24, borderRadius: 8 }} />;
```

For Clerk's theme-aware **`sx` prop**, each part must be wrapped with `makeCustomizable` (the HOC that resolves `descriptors`/`elementId` and forwards `css={sx}` down). Create a thin wrapper module in `@clerk/ui`:

```tsx
// packages/ui/src/primitives/Dialog.tsx
import { Dialog as MosaicDialog } from '@clerk/mosaic/dialog';
import type {
  DialogBackdropProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from '@clerk/mosaic/dialog';
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
  Root: MosaicDialog.Root,
  Trigger: makeCustomizable(MosaicDialog.Trigger),
  Portal: MosaicDialog.Portal,
  Backdrop: makeCustomizable(MosaicDialog.Backdrop),
  Popup: makeCustomizable(MosaicDialog.Popup),
  Title: makeCustomizable(MosaicDialog.Title),
  Description: makeCustomizable(MosaicDialog.Description),
  Close: makeCustomizable(MosaicDialog.Close),
};
```

Consumers can then style with the theme:

```tsx
<Dialog.Popup sx={t => ({ backgroundColor: t.colors.$colorBackground, padding: t.space.$6 })} />
```

### Why the explicit type annotation is required

Without the annotation, `tsc` emits **TS2742**:

> The inferred type of `Dialog` cannot be named without a reference to `@clerk/mosaic/dist/...`. This is likely not portable.

`makeCustomizable<P>` returns an internal `CustomizablePrimitive<P>` type. When TS rolls up `.d.ts`, it resolves `DialogTriggerProps = ComponentProps<'button'>` back to its source file, which isn't necessarily in the package's `exports` map. The explicit `FunctionComponent<Customizable<DialogXProps>>` annotation forces TS to reference the named `DialogXProps` type from a public entry instead of expanding it.

This would apply to **every** primitive consumed through `makeCustomizable` — Popover, Tooltip, Menu, Select, etc. Each would get its own wrapper module under `packages/ui/src/primitives/<Name>.tsx` following the pattern above.

### Pass-through parts

Parts that don't render a DOM element (e.g. `Root`, `Portal`) should **not** be wrapped — pass them through directly. `makeCustomizable` only adds value for parts that render an element with a `className`.

### Skipping the wrapper

If you only need one-off styling and don't want a wrapper module, the `render` prop is the escape hatch:

```tsx
<MosaicDialog.Popup render={props => <Box sx={{ ... }} {...props} />} />
```

Trade-off: verbose at the call site and loses automatic `descriptors`/`elementId` plumbing. Prefer the wrapper for any primitive used more than once.

## Development

These primitives build and test as part of `@clerk/mosaic`:

```sh
pnpm --filter @clerk/mosaic dev    # watch mode build
pnpm --filter @clerk/mosaic build  # production build
pnpm --filter @clerk/mosaic test   # run tests
```

Tests run under jsdom, via Mosaic's `vitest.config.mts`.
