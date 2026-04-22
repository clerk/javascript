# @clerk/headless

Headless UI primitives for Clerk's component library. These are unstyled, accessible React components built on [Floating UI](https://floating-ui.com/) that handle positioning, keyboard navigation, focus management, and ARIA attributes.

This package is **internal** (`private: true`) and consumed by `@clerk/ui`. It exists as a separate package because `@clerk/ui` uses `@emotion/react` as its JSX source, which conflicts with the standard `react-jsx` transform these primitives require.

## Primitives

| Primitive    | Import                         | Description                                             |
| ------------ | ------------------------------ | ------------------------------------------------------- |
| Accordion    | `@clerk/headless/accordion`    | Expandable content sections with single/multiple mode   |
| Autocomplete | `@clerk/headless/autocomplete` | Combobox input with filterable option list              |
| Dialog       | `@clerk/headless/dialog`       | Modal dialog with focus trapping and scroll lock        |
| Menu         | `@clerk/headless/menu`         | Dropdown and nested context menus with safe hover zones |
| Popover      | `@clerk/headless/popover`      | Non-modal floating content triggered by click           |
| Select       | `@clerk/headless/select`       | Dropdown select with typeahead and keyboard navigation  |
| Tabs         | `@clerk/headless/tabs`         | Tab navigation with animated indicator                  |
| Tooltip      | `@clerk/headless/tooltip`      | Hover/focus tooltip with configurable delay             |

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

- **Compound components** via `Object.assign` — each primitive is a single export with dot-accessed parts (`Select.Trigger`, `Select.Popup`, etc.)
- **`renderElement`** — every part uses this instead of returning JSX directly, enabling consumer `render` prop overrides and automatic state-to-data-attribute mapping
- **`data-cl-*` attributes** — structural (`data-cl-slot`), state (`data-cl-open`, `data-cl-selected`, `data-cl-active`), and animation lifecycle (`data-cl-starting-style`, `data-cl-ending-style`)
- **CSS-driven animations** — the transition system uses `data-cl-*` attributes and the Web Animations API (`getAnimations().finished`) so all timing lives in CSS
- **Floating UI** — positioning, interactions, focus management, dismiss handling, list navigation, and ARIA are all delegated to `@floating-ui/react`

## Development

```sh
pnpm dev          # watch mode build
pnpm build        # production build
pnpm test         # run tests (vitest + playwright browser mode)
```

Tests run in a real Chromium browser via `@vitest/browser-playwright`, not jsdom.
