import type { ComponentDoc } from '../../docs-schema';
import type { MenuProps } from '../../primitives/menu/menu-root';
import type {
  MenuIndicatorProps,
  MenuItemProps,
  MenuLabelProps,
  MenuMediaProps,
  MenuPopupProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from './menu';

export default {
  name: 'Menu',
  description:
    'A dropdown of actions opened from a trigger. Handles focus, arrow keys and typeahead, and closes when an item is clicked.',
  useFor: [
    'a list of actions behind an ellipsis button',
    'a row or card overflow menu',
    'a destructive action among others, with `color="negative"`',
  ],
  keywords: ['menu', 'dropdown', 'overflow', 'ellipsis', 'more actions', 'kebab'],
  practices: [
    {
      do: true,
      text: 'Give every `Menu.Item` a `label` for typeahead. It is not rendered or announced, so the item also needs visible text in `Menu.Label`.',
    },
    {
      do: true,
      text: 'Put the item text in `Menu.Label`, not straight in `Menu.Item`, so it lines up and truncates.',
    },
    { do: true, text: 'Use the same `Menu.Media` size for every item in one menu, so the text starts on one line.' },
    {
      do: true,
      text: 'Pass an `aria-label` to a `Menu.Trigger` with no children. The default ellipsis has no name.',
    },
    { do: false, text: 'Use it to pick a value. Use `Select` instead.' },
  ],
  parts: {
    'Menu.Root': {
      description: 'Holds the open state and placement. Renders no element.',
      props: {
        open: { type: 'boolean', doc: 'Whether the menu is open, when controlled.' },
        defaultOpen: { type: 'boolean', doc: 'Whether the menu starts open, when uncontrolled.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called with the new open state.' },
        placement: {
          type: 'Placement',
          doc: 'Side and alignment against the trigger.',
          default: "'bottom-start', or 'right-start' for a submenu",
        },
        sideOffset: {
          type: 'SideOffset',
          doc: 'Gap from the trigger in px, or `{ x, y }` per axis.',
          default: '4, or 0 for a submenu',
        },
        fallbackPlacements: {
          type: 'Placement[]',
          doc: 'Where the menu goes, in order, when `placement` does not fit.',
          default: 'the opposite side',
        },
        openOnHover: { type: 'boolean', doc: 'Also opens while the mouse rests on the trigger.', default: 'false' },
      },
    },
    'Menu.Trigger': {
      description:
        'Opens the menu. Renders a small neutral ghost `Button` with an ellipsis, or `children` as its label, or the `render` element.',
      slot: 'cl-menu-trigger',
      props: {
        focusableWhenDisabled: {
          type: 'boolean',
          doc: 'Keeps the default trigger in the tab order while disabled. A `render` trigger handles this itself.',
          default: 'false',
        },
      },
    },
    'Menu.Popup': {
      description: 'The floating, scrollable surface. Portals and positions itself.',
      slot: 'cl-menu-popup',
      props: {
        portalRoot: {
          type: "MenuPortalProps['root']",
          doc: 'The container the menu portals into.',
          default: '`document.body`',
        },
      },
    },
    'Menu.Item': {
      description:
        'One action, as a `button`. What it shows is the `Menu.Media`, `Menu.Label` and `Menu.Indicator` inside it.',
      slot: 'cl-menu-item',
      props: {
        label: { type: 'string', doc: 'The text typeahead matches on. Not rendered and not the accessible name.' },
        color: { type: "'neutral' | 'negative'", doc: '`neutral` or `negative`.', default: "'neutral'" },
        disabled: { type: 'boolean', doc: 'Disables the item and ignores its `onClick`.' },
        closeOnClick: { type: 'boolean', doc: 'Closes the menu after a click.', default: 'true' },
      },
    },
    'Menu.Media': {
      description: 'A square leading column that centers an icon, image or avatar.',
      slot: 'cl-menu-item-media',
      props: {
        size: {
          type: 'MenuMediaSize',
          doc: '`sm` fits an icon or avatar, `xs` a bare glyph. Sets the row height.',
          default: "'sm'",
        },
      },
    },
    'Menu.Label': {
      description: 'The item text. Fills the space between media and indicator and cuts to one line.',
      slot: 'cl-menu-item-label',
    },
    'Menu.Indicator': {
      description: 'A small square trailing slot, such as for a spinner while the action runs.',
      slot: 'cl-menu-item-indicator',
    },
    'Menu.Separator': {
      description: 'A full-width divider between groups of items.',
      slot: 'cl-menu-separator',
    },
  },
  examples: [
    {
      title: 'An overflow menu',
      code: `
<Menu.Root>
  <Menu.Trigger aria-label='More actions' />
  <Menu.Popup>
    <Menu.Item label='Rename' onClick={onRename}>
      <Menu.Label>Rename</Menu.Label>
    </Menu.Item>
    <Menu.Separator />
    <Menu.Item label='Delete' color='negative' onClick={onDelete}>
      <Menu.Label>Delete</Menu.Label>
    </Menu.Item>
  </Menu.Popup>
</Menu.Root>
`,
    },
  ],
  related: ['ActionMenu', 'Select', 'Popover'],
} satisfies ComponentDoc<{
  'Menu.Root': MenuProps;
  'Menu.Trigger': MenuTriggerProps;
  'Menu.Popup': MenuPopupProps;
  'Menu.Item': MenuItemProps;
  'Menu.Media': MenuMediaProps;
  'Menu.Label': MenuLabelProps;
  'Menu.Indicator': MenuIndicatorProps;
  'Menu.Separator': MenuSeparatorProps;
}>;
