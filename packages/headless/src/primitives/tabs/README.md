# Tabs

A tabbed interface with automatic or manual activation, keyboard navigation, and an animated indicator. Panels are shown/hidden via the HTML `hidden` attribute (not unmounted).

## When to Use

- Switching between views or content sections within the same page area.
- When you need accessible tab navigation with `role="tablist"` / `role="tab"` / `role="tabpanel"`.
- Prefer Tabs over Accordion when content sections are mutually exclusive and should feel like parallel views.

## Usage

```tsx
import { Tabs } from '@/primitives/tabs';

<Tabs defaultValue='tab1'>
  <Tabs.List>
    <Tabs.Tab value='tab1'>Account</Tabs.Tab>
    <Tabs.Tab value='tab2'>Security</Tabs.Tab>
    <Tabs.Tab value='tab3'>Notifications</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value='tab1'>Account settings content</Tabs.Panel>
  <Tabs.Panel value='tab2'>Security settings content</Tabs.Panel>
  <Tabs.Panel value='tab3'>Notification preferences content</Tabs.Panel>
</Tabs>;
```

### Controlled

```tsx
const [value, setValue] = useState('tab1');

<Tabs
  value={value}
  onValueChange={setValue}
>
  {/* ... */}
</Tabs>;
```

### Manual Activation

By default, arrowing to a tab immediately activates it. Use `activationMode="manual"` to require Enter/Space:

```tsx
<Tabs activationMode='manual'>{/* Arrow keys move focus, Enter/Space activates */}</Tabs>
```

### Vertical Orientation

```tsx
<Tabs orientation='vertical'>{/* Arrow Up/Down navigates instead of Left/Right */}</Tabs>
```

## Parts

| Part             | Default Element | Description                                |
| ---------------- | --------------- | ------------------------------------------ |
| `Tabs`           | —               | Root context provider                      |
| `Tabs.List`      | `<div>`         | Container for tabs (`role="tablist"`)      |
| `Tabs.Tab`       | `<button>`      | A tab trigger (`role="tab"`)               |
| `Tabs.Panel`     | `<div>`         | Content panel (`role="tabpanel"`)          |
| `Tabs.Indicator` | `<span>`        | Animated indicator tracking the active tab |

## Props

### `Tabs` (root)

| Prop             | Type                         | Default        | Description                               |
| ---------------- | ---------------------------- | -------------- | ----------------------------------------- |
| `value`          | `string`                     | —              | Controlled active tab                     |
| `defaultValue`   | `string`                     | `""`           | Initial active tab (uncontrolled)         |
| `onValueChange`  | `(value: string) => void`    | —              | Called when active tab changes            |
| `orientation`    | `"horizontal" \| "vertical"` | `"horizontal"` | Arrow key direction                       |
| `activationMode` | `"automatic" \| "manual"`    | `"automatic"`  | Whether focus activates a tab immediately |

### `Tabs.Tab`

| Prop       | Type      | Default      | Description                                                |
| ---------- | --------- | ------------ | ---------------------------------------------------------- |
| `value`    | `string`  | **required** | Unique tab identifier, must match a Panel's `value`        |
| `disabled` | `boolean` | —            | Disables the tab (uses `aria-disabled`, remains focusable) |

### `Tabs.Panel`

| Prop    | Type     | Default      | Description                |
| ------- | -------- | ------------ | -------------------------- |
| `value` | `string` | **required** | Must match a Tab's `value` |

### `Tabs.List`, `Tabs.Indicator`

No additional props beyond standard HTML attributes and the `render` prop.

## Keyboard Navigation

| Key               | Action (horizontal)        | Action (vertical)          |
| ----------------- | -------------------------- | -------------------------- |
| `ArrowRight`      | Next tab                   | —                          |
| `ArrowLeft`       | Previous tab               | —                          |
| `ArrowDown`       | —                          | Next tab                   |
| `ArrowUp`         | —                          | Previous tab               |
| `Enter` / `Space` | Activate tab (manual mode) | Activate tab (manual mode) |

## Data Attributes

| Attribute          | Applies To | Description                         |
| ------------------ | ---------- | ----------------------------------- |
| `data-cl-slot`     | All parts  | Part identifier (e.g. `"tabs-tab"`) |
| `data-cl-selected` | Tab        | Active tab                          |
| `data-cl-disabled` | Tab        | Disabled tab                        |
| `data-cl-hidden`   | Panel      | Inactive panel                      |

## Indicator CSS Variables

`Tabs.Indicator` exposes CSS custom properties for positioning and sizing:

| CSS Variable   | Description                        |
| -------------- | ---------------------------------- |
| `--tab-left`   | Left offset of the active tab (px) |
| `--tab-width`  | Width of the active tab (px)       |
| `--tab-top`    | Top offset of the active tab (px)  |
| `--tab-height` | Height of the active tab (px)      |

Use these to animate the indicator:

```css
[data-cl-slot='tabs-indicator'] {
  position: absolute;
  left: var(--tab-left);
  width: var(--tab-width);
  transition:
    left 200ms ease,
    width 200ms ease;
}
```

The initial render suppresses the transition to prevent the indicator from animating from `0,0`.

## Important Notes

- **`Tabs.List` must have `position: relative`** in your CSS for the indicator to position correctly.
- **Panels use the `hidden` attribute** — they stay in the DOM but are hidden when inactive. This preserves state in inactive panels.
- **Disabled tabs use `aria-disabled`**, not the native `disabled` attribute, keeping them focusable for keyboard users.
- **Indicator is `aria-hidden`** — it's purely decorative.

## ARIA

- List: `role="tablist"`
- Tab: `role="tab"`, `aria-selected`, `aria-controls` (pointing to its panel), `aria-disabled`
- Panel: `role="tabpanel"`, `aria-labelledby` (pointing to its tab), `tabIndex={0}`
