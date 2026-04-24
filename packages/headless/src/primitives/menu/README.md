# Menu

A dropdown menu with keyboard navigation, typeahead, and nested submenu support. Handles ARIA roles, safe hover zones for submenus, and tree-level close-on-click.

## When to Use

- Action menus, context menus, dropdown menus attached to a button trigger.
- When you need nested submenus with safe pointer zones between trigger and submenu.
- Prefer Menu over Popover when the content is a list of actions/commands rather than arbitrary content.

## Usage

```tsx
import { Menu } from '@/primitives/menu';

<Menu>
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
</Menu>;
```

### Nested Submenus

Nest a `<Menu>` inside a parent `<Menu>` — the nested trigger automatically renders as a `menuitem` and opens on hover with a safe polygon zone.

```tsx
<Menu>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Positioner>
    <Menu.Popup>
      <Menu.Item label='Edit' />
      <Menu>
        <Menu.Trigger>Share</Menu.Trigger>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item label='Copy Link' />
            <Menu.Item label='Email' />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu>
    </Menu.Popup>
  </Menu.Positioner>
</Menu>
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Menu
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Menu>;
```

## Parts

| Part              | Default Element | Description                            |
| ----------------- | --------------- | -------------------------------------- |
| `Menu`            | —               | Root context provider                  |
| `Menu.Trigger`    | `<button>`      | Opens/closes the menu                  |
| `Menu.Portal`     | —               | Portals children (accepts `root` prop) |
| `Menu.Positioner` | `<div>`         | Floating positioned container          |
| `Menu.Popup`      | `<div>`         | Visual wrapper for menu items          |
| `Menu.Item`       | `<button>`      | A menu action item                     |
| `Menu.Separator`  | `<div>`         | Visual divider between items           |
| `Menu.Arrow`      | `<svg>`         | Optional floating arrow                |

## Props

### `Menu` (root)

| Prop           | Type                      | Default                                           | Description                        |
| -------------- | ------------------------- | ------------------------------------------------- | ---------------------------------- |
| `open`         | `boolean`                 | —                                                 | Controlled open state              |
| `defaultOpen`  | `boolean`                 | `false`                                           | Initial open state (uncontrolled)  |
| `onOpenChange` | `(open: boolean) => void` | —                                                 | Called when open state changes     |
| `placement`    | `Placement`               | `"bottom-start"` (root), `"right-start"` (nested) | Floating UI placement              |
| `sideOffset`   | `number`                  | `4` (root), `0` (nested)                          | Gap between trigger and popup (px) |

### `Menu.Item`

| Prop           | Type      | Default      | Description                                            |
| -------------- | --------- | ------------ | ------------------------------------------------------ |
| `label`        | `string`  | **required** | Item text, also used for typeahead matching            |
| `disabled`     | `boolean` | —            | Prevents click handler, keeps item focusable           |
| `closeOnClick` | `boolean` | `true`       | Whether clicking this item closes the entire menu tree |

### `Menu.Trigger`, `Menu.Positioner`, `Menu.Popup`, `Menu.Separator`

No additional props beyond standard HTML attributes and the `render` prop.

### `Menu.Arrow`

Accepts all `FloatingArrow` props. `ref` and `context` are injected automatically.

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

| Attribute                         | Applies To        | Description                          |
| --------------------------------- | ----------------- | ------------------------------------ |
| `data-cl-slot`                    | All parts         | Part identifier (e.g. `"menu-item"`) |
| `data-cl-open` / `data-cl-closed` | Trigger           | Menu open state                      |
| `data-cl-active`                  | Item              | Keyboard-focused item                |
| `data-cl-disabled`                | Item              | Disabled item                        |
| `data-cl-side`                    | Positioner, Arrow | Resolved placement side              |

## Nested Menu Behavior

- Nested menus open on hover (75ms delay) with a `safePolygon` safe zone.
- Only one sibling submenu can be open at a time.
- Clicking any item with `closeOnClick={true}` (default) closes the entire menu tree via a tree event.
- `Escape` closes the innermost menu first, bubbling up through the tree.

## Important Notes

- **No built-in animations.** The positioner simply mounts/unmounts. Use `data-cl-open`/`data-cl-closed` for CSS-driven transitions.
- **Disabled items use `aria-disabled`, not `disabled`.** They remain focusable for keyboard users.
- **`label` is required on `Menu.Item`** — it drives typeahead matching. Disabled items are excluded from typeahead.

## ARIA

- Popup: `role="menu"`
- Item: `role="menuitem"`, `aria-disabled`
- Separator: `role="separator"`
- Trigger: `aria-expanded`, `aria-haspopup="menu"`, `aria-controls`
- Nested trigger: `role="menuitem"` (instead of button)
