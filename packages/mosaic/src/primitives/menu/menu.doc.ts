import type { ComponentDoc } from '../../docs-schema';
import type { MenuArrowProps } from './menu-arrow';
import type { MenuItemProps } from './menu-item';
import type { MenuPopupProps } from './menu-popup';
import type { MenuPortalProps } from './menu-portal';
import type { MenuPositionerProps } from './menu-positioner';
import type { MenuProps } from './menu-root';
import type { MenuSeparatorProps } from './menu-separator';
import type { MenuTriggerProps } from './menu-trigger';

export default {
  name: 'Menu',
  description:
    'Headless, unstyled dropdown menu of actions, with arrow-key navigation, typeahead and nested submenus. Wires `role="menu"`, `role="menuitem"` and the trigger’s `aria-expanded`, `aria-haspopup` and `aria-controls`.',
  useFor: [
    'an actions menu opened from a button',
    'a dropdown of commands, such as edit, duplicate and delete',
    'a nested submenu inside a menu',
    'a menu that opens on hover',
  ],
  keywords: ['menu', 'dropdown', 'actions', 'context menu', 'submenu', 'kebab', 'overflow menu'],
  practices: [
    { do: true, text: 'Pass `label` on every `Menu.Item`. Typeahead matches on it.' },
    {
      do: true,
      text: 'Nest a `Menu.Root` inside a `Menu.Popup` for a submenu. Its trigger becomes a `menuitem` that opens on hover.',
    },
    {
      do: true,
      text: 'Set `fallbackPlacements` for a menu opened inside another floating surface, so it does not flip onto that surface.',
    },
    {
      do: true,
      text: 'Animate with `data-starting-style` and `data-ending-style` on `Menu.Popup`. The popup unmounts once its exit transition ends.',
    },
    { do: false, text: 'Pass `id` to `Menu.Positioner`. The primitive owns it to pair the trigger’s `aria-controls`.' },
    { do: false, text: 'Use it for arbitrary content or a form. Use `Popover` instead.' },
  ],
  parts: {
    'Menu.Root': {
      description:
        'Holds the open state, placement and list navigation. Renders no element. Nested inside another menu, it becomes a submenu.',
      props: {
        open: { type: 'boolean', doc: 'Whether the menu is open, when controlled.' },
        defaultOpen: {
          type: 'boolean',
          doc: 'Whether the menu is open on mount, when uncontrolled.',
          default: 'false',
        },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: {
          type: 'Placement',
          doc: 'Where the menu sits against its trigger.',
          default: "'bottom-start', or 'right-start' for a submenu",
        },
        sideOffset: {
          type: 'SideOffset',
          doc: 'Gap to the trigger in px. `{ x, y }` sets one gap per axis.',
          default: '4, or 0 for a submenu',
        },
        fallbackPlacements: { type: 'Placement[]', doc: 'Placements to try, in order, when `placement` does not fit.' },
        openOnHover: {
          type: 'boolean',
          doc: 'Opens when a mouse rests on the trigger. A press still opens it and keeps it open.',
          default: 'false',
        },
      },
    },
    'Menu.Trigger': {
      description:
        'A `button` that toggles the menu. Carries `data-open` or `data-closed`. Inside a parent menu it renders as `role="menuitem"`.',
    },
    'Menu.Portal': {
      description: 'Portals its children while the menu is mounted.',
      props: {
        root: {
          type: 'HTMLElement | null | React.RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `Portal` container',
        },
      },
    },
    'Menu.Positioner': {
      description:
        'The floating `div`, placed against the trigger. Carries `data-side` and the `--cl-anchor-*`, `--cl-available-*` and `--cl-transform-origin` variables. Manages focus and handles `Home` and `End`.',
    },
    'Menu.Popup': {
      description:
        'Wraps the items. Carries `data-open`, `data-closed`, `data-starting-style` and `data-ending-style`, and is inert while closing.',
    },
    'Menu.Item': {
      description:
        'A `button` with `role="menuitem"`. Carries `data-active` while focused and `data-disabled`. Clicking it closes the whole menu tree.',
      props: {
        label: { type: 'string', doc: 'The text typeahead matches on.' },
        disabled: { type: 'boolean', doc: 'Sets `aria-disabled` and skips `onClick`. The item stays focusable.' },
        closeOnClick: { type: 'boolean', doc: 'Whether a click closes the whole menu tree.', default: 'true' },
      },
    },
    'Menu.Separator': { description: 'A `div` with `role="separator"` between items.' },
    'Menu.Arrow': { description: 'An optional `FloatingArrow` `svg` pointing at the trigger. Carries `data-side`.' },
  },
  examples: [
    {
      title: 'Actions menu',
      code: `
<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Positioner>
    <Menu.Popup>
      <Menu.Item label='Edit' onClick={onEdit} />
      <Menu.Separator />
      <Menu.Item label='Delete' onClick={onDelete} />
    </Menu.Popup>
  </Menu.Positioner>
</Menu.Root>
`,
    },
  ],
  related: ['Popover', 'Select', 'Portal'],
} satisfies ComponentDoc<{
  'Menu.Root': MenuProps;
  'Menu.Trigger': MenuTriggerProps;
  'Menu.Portal': MenuPortalProps;
  'Menu.Positioner': MenuPositionerProps;
  'Menu.Popup': MenuPopupProps;
  'Menu.Item': MenuItemProps;
  'Menu.Separator': MenuSeparatorProps;
  'Menu.Arrow': MenuArrowProps;
}>;
