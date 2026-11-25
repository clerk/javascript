import type { ComponentDoc } from '../../docs-schema';
import type { MenuProps } from '../../primitives/menu/menu-root';
import type {
  MenuCheckboxItemIndicatorProps,
  MenuCheckboxItemProps,
  MenuItemProps,
  MenuLabelProps,
  MenuMediaProps,
  MenuPopupProps,
  MenuRadioGroupProps,
  MenuRadioItemIndicatorProps,
  MenuRadioItemProps,
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
    'a setting toggled on or off, with `Menu.CheckboxItem`',
    'marking the current choice, such as the active account, with `Menu.RadioItem`',
  ],
  keywords: ['menu', 'dropdown', 'overflow', 'ellipsis', 'more actions', 'kebab', 'checkbox', 'radio', 'checked'],
  practices: [
    {
      do: true,
      text: 'Give every `Menu.Item` a `label` for typeahead. It is not rendered or announced, so the item also needs visible text in `Menu.Label`.',
    },
    {
      do: true,
      text: 'Put the item text in `Menu.Label`, not straight in `Menu.Item`, so it lines up and truncates.',
    },
    {
      do: true,
      text: 'Pass an `aria-label` to a `Menu.Trigger` with no children. The default ellipsis has no name.',
    },
    {
      do: true,
      text: 'Show a checked state with `Menu.CheckboxItem` or `Menu.RadioItem` and their indicator, not a checkmark in `Menu.Media`, so `aria-checked` announces it.',
    },
    { do: false, text: 'Use it as a form field that picks a value. Use `Select` instead.' },
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
      description: 'One action, as a `button`. What it shows is the `Menu.Media` and `Menu.Label` inside it.',
      slot: 'cl-menu-item',
      props: {
        label: { type: 'string', doc: 'The text typeahead matches on. Not rendered and not the accessible name.' },
        color: { type: "'neutral' | 'negative'", doc: '`neutral` or `negative`.', default: "'neutral'" },
        disabled: { type: 'boolean', doc: 'Disables the item and ignores its `onClick`.' },
        closeOnClick: { type: 'boolean', doc: 'Closes the menu after a click.', default: 'true' },
      },
    },
    'Menu.Media': {
      description:
        'A square column at either end of the row that centers an icon, image, avatar or spinner. Keeps its width while empty.',
      slot: 'cl-menu-item-media',
    },
    'Menu.Label': {
      description: 'The item text. Fills the space between the media at either end and cuts to one line.',
      slot: 'cl-menu-item-label',
    },
    'Menu.CheckboxItem': {
      description:
        'An item that toggles on and off, as a `button` with `role="menuitemcheckbox"`. Keeps the menu open on click by default.',
      slot: 'cl-menu-checkbox-item',
      props: {
        label: { type: 'string', doc: 'The text typeahead matches on. Not rendered and not the accessible name.' },
        checked: { type: 'boolean', doc: 'Whether the item is checked, when controlled.' },
        defaultChecked: {
          type: 'boolean',
          doc: 'Whether the item starts checked, when uncontrolled.',
          default: 'false',
        },
        onCheckedChange: { type: '(checked: boolean) => void', doc: 'Called with the new checked state.' },
        disabled: { type: 'boolean', doc: 'Disables the item and ignores its `onClick`.' },
        closeOnClick: { type: 'boolean', doc: 'Closes the menu after a click.', default: 'false' },
      },
    },
    'Menu.RadioGroup': {
      description: 'Holds the value of the radio items inside it. Name it with `aria-label`.',
      slot: 'cl-menu-radio-group',
      props: {
        value: { type: 'string', doc: "The checked item's value, when controlled." },
        defaultValue: { type: 'string', doc: "The checked item's value on mount, when uncontrolled." },
        onValueChange: {
          type: '(value: string) => void',
          doc: "Called with the picked item's value, even when it is already checked.",
        },
        disabled: { type: 'boolean', doc: 'Disables every item in the group.' },
      },
    },
    'Menu.RadioItem': {
      description:
        'An item that picks its group\'s value, as a `button` with `role="menuitemradio"`. Keeps the menu open on click by default.',
      slot: 'cl-menu-radio-item',
      props: {
        label: { type: 'string', doc: 'The text typeahead matches on. Not rendered and not the accessible name.' },
        value: { type: 'string', doc: 'The value the group takes when this item is picked.' },
        disabled: { type: 'boolean', doc: 'Disables the item and ignores its `onClick`.' },
        closeOnClick: { type: 'boolean', doc: 'Closes the menu after a click.', default: 'false' },
      },
    },
    'Menu.CheckboxItemIndicator': {
      description:
        'A square column in every row with a check in the secondary icon color, shown only while its checkbox item is checked.',
      slot: 'cl-menu-checkbox-item-indicator',
      props: {
        keepMounted: {
          type: 'boolean',
          doc: 'Keeps its column, with the check hidden, while unchecked, so labels line up. Pass `false` to render it only while checked.',
          default: 'true',
        },
      },
    },
    'Menu.RadioItemIndicator': {
      description:
        'A square column in every row with a check in the secondary icon color, shown only while its radio item is checked.',
      slot: 'cl-menu-radio-item-indicator',
      props: {
        keepMounted: {
          type: 'boolean',
          doc: 'Keeps its column, with the check hidden, while unchecked, so labels line up. Pass `false` to render it only while checked.',
          default: 'true',
        },
      },
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
    {
      title: 'Picking the current account',
      code: `
<Menu.RadioGroup aria-label='Accounts' value={activeId} onValueChange={switchTo}>
  {accounts.map(account => (
    <Menu.RadioItem key={account.id} label={account.name} value={account.id} closeOnClick>
      <Menu.Label>{account.name}</Menu.Label>
      <Menu.RadioItemIndicator />
    </Menu.RadioItem>
  ))}
</Menu.RadioGroup>
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
  'Menu.CheckboxItem': MenuCheckboxItemProps;
  'Menu.RadioGroup': MenuRadioGroupProps;
  'Menu.RadioItem': MenuRadioItemProps;
  'Menu.CheckboxItemIndicator': MenuCheckboxItemIndicatorProps;
  'Menu.RadioItemIndicator': MenuRadioItemIndicatorProps;
  'Menu.Separator': MenuSeparatorProps;
}>;
