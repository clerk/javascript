# Primitives

Headless UI primitives for Mosaic. These are unstyled, accessible React components built on [Floating UI](https://floating-ui.com/) that handle positioning, keyboard navigation, focus management, and ARIA attributes.

The primitives are **internal** to `@clerk/mosaic`: the styled components in `src/components` import them by relative path, and they are not part of the package's public exports. Swingset stories reach them through the `@clerk/mosaic/primitives/<name>` source alias.

## Primitives

| Primitive    | Import                                  | Description                                                   |
| ------------ | --------------------------------------- | ------------------------------------------------------------- |
| Accordion    | `@clerk/mosaic/primitives/accordion`    | Expandable content sections with single/multiple mode         |
| Autocomplete | `@clerk/mosaic/primitives/autocomplete` | Combobox input with filterable option list                    |
| Dialog       | `@clerk/mosaic/primitives/dialog`       | Modal dialog with focus trapping and scroll lock              |
| FileUpload   | `@clerk/mosaic/primitives/file-upload`  | File picker + drag-and-drop upload with image previews        |
| Menu         | `@clerk/mosaic/primitives/menu`         | Dropdown and nested context menus with safe hover zones       |
| OTP          | `@clerk/mosaic/primitives/otp`          | One-time-password / PIN input split into per-character slots  |
| Popover      | `@clerk/mosaic/primitives/popover`      | Non-modal floating content triggered by click                 |
| Select       | `@clerk/mosaic/primitives/select`       | Dropdown select with typeahead and keyboard navigation        |
| Tabs         | `@clerk/mosaic/primitives/tabs`         | Tab navigation with animated indicator                        |
| Tooltip      | `@clerk/mosaic/primitives/tooltip`      | Hover/focus tooltip with configurable delay and group support |

Shared utilities live in `src/utils` (includes `useRender` and `mergeProps`) and shared hooks in `src/hooks`.

Each primitive has its own README in its folder with full API docs, props tables, keyboard navigation, and data attributes.

## Usage

```tsx
import { Select } from '@clerk/mosaic/primitives/select';

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

## Testing

```sh
pnpm --filter @clerk/mosaic test
```

Primitive tests run as the `primitives` vitest project (happy-dom, jest-dom matchers, and `axe` assertions via `vitest.primitives.setup.mts`), separate from the jsdom project the rest of Mosaic uses.
