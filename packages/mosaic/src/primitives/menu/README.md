# Menu

A dropdown menu with keyboard navigation, typeahead, and nested submenu support. Handles ARIA roles, safe hover zones for submenus, and tree-level close-on-click.

## When to Use

- Action menus, context menus, dropdown menus attached to a button trigger.
- When you need nested submenus with safe pointer zones between trigger and submenu.
- Prefer Menu over Popover when the content is a list of actions/commands rather than arbitrary content.

## Usage

```tsx
import { Menu } from '@/primitives/menu';

<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Positioner>
    <Menu.Popup>
      <Menu.Item
        label='Edit'
        onClick={() => handleEdit()}
      />
      <Menu.Item
        label='Duplicate'
        onClick={() => handleDuplicate()}
      />
      <Menu.Separator />
      <Menu.Item
        label='Delete'
        onClick={() => handleDelete()}
      />
    </Menu.Popup>
  </Menu.Positioner>
</Menu.Root>;
```

### Nested Submenus

Nest a `<Menu.Root>` inside a parent `<Menu.Root>` — the nested trigger automatically renders as a `menuitem` and opens on hover with a safe polygon zone.

```tsx
<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Positioner>
    <Menu.Popup>
      <Menu.Item label='Edit' />
      <Menu.Root>
        <Menu.Trigger>Share</Menu.Trigger>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item label='Copy Link' />
            <Menu.Item label='Email' />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Root>
    </Menu.Popup>
  </Menu.Positioner>
</Menu.Root>
```

### Checkbox and Radio Items

`Menu.CheckboxItem` toggles a setting; `Menu.RadioItem` picks one value from its `Menu.RadioGroup`. Both keep the menu open on click unless you pass `closeOnClick`. Their indicator renders only while the item is checked.

```tsx
<Menu.CheckboxItem
  label='Show archived'
  checked={showArchived}
  onCheckedChange={setShowArchived}
>
  Show archived
  <Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>
</Menu.CheckboxItem>
<Menu.RadioGroup
  aria-label='Sort by'
  value={sort}
  onValueChange={setSort}
>
  <Menu.RadioItem
    label='Name'
    value='name'
  >
    Name
    <Menu.RadioItemIndicator>✓</Menu.RadioItemIndicator>
  </Menu.RadioItem>
</Menu.RadioGroup>
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Menu.Root
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Menu.Root>;
```

## Parts

| Part                         | Default Element | Description                                 |
| ---------------------------- | --------------- | ------------------------------------------- |
| `Menu.Root`                  | —               | Root context provider                       |
| `Menu.Trigger`               | `<button>`      | Opens/closes the menu                       |
| `Menu.Portal`                | —               | Portals children (accepts `root` prop)      |
| `Menu.Positioner`            | `<div>`         | Floating positioned container               |
| `Menu.Popup`                 | `<div>`         | Visual wrapper for menu items               |
| `Menu.Item`                  | `<button>`      | A menu action item                          |
| `Menu.CheckboxItem`          | `<button>`      | An item that toggles on and off             |
| `Menu.RadioGroup`            | `<div>`         | Holds the value of its radio items          |
| `Menu.RadioItem`             | `<button>`      | An item that picks its group's value        |
| `Menu.CheckboxItemIndicator` | `<span>`        | Rendered while its checkbox item is checked |
| `Menu.RadioItemIndicator`    | `<span>`        | Rendered while its radio item is checked    |
| `Menu.Separator`             | `<div>`         | Visual divider between items                |
| `Menu.Arrow`                 | `<svg>`         | Optional floating arrow                     |

## Props

### `Menu.Root`

| Prop           | Type                      | Default                                           | Description                        |
| -------------- | ------------------------- | ------------------------------------------------- | ---------------------------------- |
| `open`         | `boolean`                 | —                                                 | Controlled open state              |
| `defaultOpen`  | `boolean`                 | `false`                                           | Initial open state (uncontrolled)  |
| `onOpenChange` | `(open: boolean) => void` | —                                                 | Called when open state changes     |
| `placement`    | `Placement`               | `"bottom-start"` (root), `"right-start"` (nested) | Floating UI placement              |
| `sideOffset`   | `number`                  | `4` (root), `0` (nested)                          | Gap between trigger and popup (px) |
| `openOnHover`  | `boolean`                 | `false`                                           | Open when a mouse rests on trigger |

### `Menu.Item`

| Prop           | Type      | Default      | Description                                            |
| -------------- | --------- | ------------ | ------------------------------------------------------ |
| `label`        | `string`  | **required** | Item text, also used for typeahead matching            |
| `disabled`     | `boolean` | —            | Prevents click handler, keeps item focusable           |
| `closeOnClick` | `boolean` | `true`       | Whether clicking this item closes the entire menu tree |

### `Menu.CheckboxItem`

Takes every `Menu.Item` prop, with `closeOnClick` defaulting to `false`.

| Prop              | Type                         | Default | Description                          |
| ----------------- | ---------------------------- | ------- | ------------------------------------ |
| `checked`         | `boolean`                    | —       | Controlled checked state             |
| `defaultChecked`  | `boolean`                    | `false` | Initial checked state (uncontrolled) |
| `onCheckedChange` | `(checked: boolean) => void` | —       | Called with the new checked state    |

### `Menu.RadioGroup`

| Prop            | Type                      | Default | Description                                                   |
| --------------- | ------------------------- | ------- | ------------------------------------------------------------- |
| `value`         | `string`                  | —       | Controlled checked value                                      |
| `defaultValue`  | `string`                  | —       | Initial checked value (uncontrolled)                          |
| `onValueChange` | `(value: string) => void` | —       | Called with the picked value, even when it is already checked |
| `disabled`      | `boolean`                 | `false` | Disables every item in the group                              |

### `Menu.RadioItem`

Takes every `Menu.Item` prop plus a required `value: string`, with `closeOnClick` defaulting to `false`.

### `Menu.CheckboxItemIndicator`, `Menu.RadioItemIndicator`

| Prop          | Type      | Default | Description                                                 |
| ------------- | --------- | ------- | ----------------------------------------------------------- |
| `keepMounted` | `boolean` | `false` | Keep it in the DOM while unchecked, marked `data-unchecked` |

### `Menu.Trigger`, `Menu.Positioner`, `Menu.Popup`, `Menu.Separator`

No additional props beyond standard HTML attributes and the `render` prop.

### `Menu.Arrow`

Accepts all `FloatingArrow` props and forwards `ref`. `context` is injected automatically.

## Keyboard Navigation

| Key               | Action                                 |
| ----------------- | -------------------------------------- |
| `ArrowDown`       | Move to next item                      |
| `ArrowUp`         | Move to previous item                  |
| `ArrowRight`      | Open nested submenu                    |
| `ArrowLeft`       | Close nested submenu, return to parent |
| `Enter` / `Space` | Activate the focused item              |
| `Escape`          | Close the current menu level           |
| Type a character  | Jump to matching item (typeahead)      |

## Data Attributes

| Attribute                         | Applies To                           | Description             |
| --------------------------------- | ------------------------------------ | ----------------------- |
| `data-open` / `data-closed`       | Trigger                              | Menu open state         |
| `data-active`                     | Item                                 | Keyboard-focused item   |
| `data-disabled`                   | Item                                 | Disabled item           |
| `data-checked` / `data-unchecked` | Checkbox item, radio item, indicator | Checked state           |
| `data-side`                       | Positioner, Arrow                    | Resolved placement side |

## Open on Hover

- `openOnHover` opens a top-level menu on mouse hover (75ms delay) with the same `safePolygon` safe zone as nested menus. Touch is ignored for hover; a tap opens it as usual.
- A press on the trigger of a hover-opened menu keeps it open; a second press closes it. A menu opened by a press stays open when the mouse leaves.
- A hover open leaves focus where it was, like a nested menu.

## Nested Menu Behavior

- Nested menus open on hover (75ms delay) with a `safePolygon` safe zone.
- Only one sibling submenu can be open at a time.
- Clicking any item with `closeOnClick={true}` (default) closes the entire menu tree via a tree event.
- `Escape` closes one level: the innermost open menu, leaving its parent — a parent menu, or a `Popover` the menu is rendered inside — open. Pressing it again closes the next level up. An outside press is the opposite: it dismisses the whole stack at once.

## Important Notes

- **No built-in animations.** The positioner simply mounts/unmounts. Use `data-open`/`data-closed` for CSS-driven transitions.
- **Disabled items use `aria-disabled`, not `disabled`.** They remain focusable for keyboard users.
- **`label` is required on `Menu.Item`** — it drives typeahead matching. Disabled items are excluded from typeahead.

## ARIA

- Popup: `role="menu"`
- Item: `role="menuitem"`, `aria-disabled`
- Checkbox item: `role="menuitemcheckbox"`, `aria-checked`
- Radio group: `role="group"`, `aria-disabled`
- Radio item: `role="menuitemradio"`, `aria-checked`
- Indicator: `aria-hidden="true"`
- Separator: `role="separator"`
- Trigger: `aria-expanded`, `aria-haspopup="menu"`, `aria-controls`
- Nested trigger: `role="menuitem"` (instead of button)
