import type { ComponentDoc } from '../../docs-schema';
import type { SwitcherAvatarProps, SwitcherBadgedAvatarProps } from './switcher-avatar';
import type { SwitcherHeaderProps } from './switcher-header';
import type {
  SwitcherGroupProps,
  SwitcherItemContentProps,
  SwitcherItemDescriptionProps,
  SwitcherItemLabelProps,
  SwitcherItemMediaProps,
  SwitcherItemProps,
  SwitcherItemTrailingProps,
  SwitcherSeparatorProps,
} from './switcher-item';
import type { SwitcherPopupProps } from './switcher-popup';
import type { SwitcherRootProps } from './switcher-root';
import type { SwitcherTriggerProps } from './switcher-trigger';

export default {
  name: 'Switcher',
  description:
    "The account and organization switcher. `Switcher.Root` holds the open state, `Switcher.Trigger` opens it, and `Switcher.Popup` positions a `Card` holding `Switcher.Header`, then `Switcher.Group`s of `Switcher.Item`s split by `Switcher.Separator`s. `UserButton`, `OrganizationSwitcher` and `Switcher` from `@clerk/mosaic` compose these parts with Clerk's session and organization state. The parts carry `cl-switcher-*` classes; inside `UserButton` and `OrganizationSwitcher` the same parts carry `cl-user-button-*` and `cl-organization-switcher-*`. `Switcher.Avatar` carries `cl-avatar`.",
  useFor: ['an account or organization switcher composed from its parts'],
  keywords: ['switcher', 'user button', 'organization switcher', 'account switcher', 'menu rows'],
  practices: [
    {
      do: true,
      text: 'Put `Switcher.Trigger` and `Switcher.Popup` inside one `Switcher.Root`, and label the popup with `aria-label`.',
    },
    {
      do: true,
      text: 'Wrap rows in a `Switcher.Group`, and split groups with a `Switcher.Separator`.',
    },
    {
      do: true,
      text: 'Pass `render` to `Switcher.Item` to make a row a button or link. It then takes the hover and press styles.',
    },
    {
      do: false,
      text: 'Expect the parts to read Clerk. They render the props they are given; `UserButton` and `OrganizationSwitcher` connect them to Clerk.',
    },
  ],
  parts: {
    'Switcher.Root': {
      description: 'Holds the open state. Renders no element of its own.',
      props: {
        open: { type: 'boolean', doc: 'The controlled open state.' },
        defaultOpen: { type: 'boolean', doc: 'The initial open state when uncontrolled.', default: 'false' },
        onOpenChange: { type: '(open: boolean) => void', doc: 'Called when the popup opens or closes.' },
        placement: { type: 'Placement', doc: 'Where the popup sits against the trigger.', default: "'bottom-start'" },
        sideOffset: { type: 'number', doc: 'The gap between the trigger and the popup.', default: '4' },
        alignOffset: { type: 'number', doc: 'Shifts the popup along the trigger edge.', default: '0' },
      },
    },
    'Switcher.Trigger': {
      description:
        'Opens the popup. With a `name` it shows the name, the badge and a caret; without one, the avatar alone.',
      slot: 'cl-switcher-trigger',
      props: {
        avatar: { type: 'ReactNode', doc: "The lead's mark, such as a `Switcher.BadgedAvatar`." },
        name: { type: 'string', doc: "The lead's name. Leave it out for the avatar-only trigger." },
        badge: { type: 'string', doc: 'A plan or status label beside the name.' },
        badgeId: { type: 'string', doc: 'Set as `data-badge-id` on the badge.' },
        shape: {
          type: "'circle' | 'square'",
          doc: 'Rounds the avatar-only trigger to match a circular avatar.',
          default: "'square'",
        },
        variant: {
          type: "'full' | 'condensed'",
          doc: 'Which mark the trigger carries, set as `data-variant`: `full` for a `Switcher.BadgedAvatar`, `condensed` for a `Switcher.Avatar`.',
          default: "'condensed'",
        },
      },
    },
    'Switcher.Popup': {
      description:
        'The floating popup: portals, positions against the trigger, and paints a `Card` holding its children. A dialog named by `aria-label`.',
      slot: 'cl-switcher-popover',
      props: {
        'aria-label': { type: 'string', doc: 'Names the popup.' },
        renderBranding: { type: 'boolean', doc: 'Shows Clerk branding at the foot of the card.', default: 'true' },
      },
    },
    'Switcher.Header': {
      description: "The popover's header: the lead's avatar, its name and a description.",
      slot: 'cl-switcher-header',
      props: {
        avatar: { type: 'ReactNode', doc: 'The leading mark.' },
        title: { type: 'string', doc: 'The name, on one line.' },
        description: { type: 'string', doc: 'A second line, such as an email address.' },
      },
    },
    'Switcher.Avatar': {
      description: 'A decorative avatar with initials as its fallback, hidden from assistive tech.',
      slot: 'cl-avatar',
      props: {
        name: { type: 'string', doc: 'The name the initials come from.' },
        imageUrl: { type: 'string', doc: 'The image.' },
        shape: { type: "'circle' | 'square'", doc: 'Circle for a person, square for an organization.' },
        size: { type: "'xs' | 'sm' | 'md' | 'lg' | 'fit'", doc: 'Box size. `fit` fills the parent.' },
      },
    },
    'Switcher.BadgedAvatar': {
      description: "An organization's square avatar with a person's round avatar cut into its corner.",
      slot: 'cl-switcher-avatar',
      props: {
        name: { type: 'string', doc: 'The lead name.' },
        imageUrl: { type: 'string', doc: 'The lead image.' },
        badge: { type: '{ name: string; imageUrl?: string }', doc: 'The person in the corner.' },
        size: { type: "'sm' | 'md'", doc: 'Box size.' },
      },
    },
    'Switcher.Group': {
      description: 'A run of rows inside the popover.',
      slot: 'cl-switcher-group',
    },
    'Switcher.Separator': {
      description: 'A rule between groups.',
      slot: 'cl-switcher-separator',
    },
    'Switcher.Item': {
      description: 'One row. Renders a `div`, or the `render` element, which makes it interactive.',
      slot: 'cl-switcher-item',
    },
    'Switcher.ItemMedia': {
      description: "The row's leading avatar or icon.",
      slot: 'cl-switcher-item-media',
    },
    'Switcher.ItemContent': {
      description: "The row's text column.",
      slot: 'cl-switcher-item-content',
    },
    'Switcher.ItemLabel': {
      description: "The row's name, on one line.",
      slot: 'cl-switcher-item-label',
      props: {
        variant: {
          type: "'default' | 'interactive'",
          doc: "`default` names the row's subject. `interactive` takes the row's color, for rows such as `Sign out`.",
          default: "'default'",
        },
      },
    },
    'Switcher.ItemDescription': {
      description: 'A second line under the label.',
      slot: 'cl-switcher-item-description',
    },
    'Switcher.ItemTrailing': {
      description: 'Content at the end of the row, such as a checkmark or a badge.',
      slot: 'cl-switcher-item-trailing',
    },
  },
  examples: [
    {
      title: 'A trigger and its popup',
      code: `
<Switcher.Root>
  <Switcher.Trigger
    aria-label='Open account menu'
    avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='sm' />}
    name='Acme'
    badge='Pro'
    variant='full'
  />
  <Switcher.Popup aria-label='Account menu'>
    <Switcher.Header
      avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='md' />}
      title='Acme'
      description='alice@example.com'
    />
    <Switcher.Separator />
    <Switcher.Group>
      <Switcher.Item render={<button type='button' />}>
        <Switcher.ItemMedia>
          <Switcher.Avatar name='Globex' shape='square' size='sm' />
        </Switcher.ItemMedia>
        <Switcher.ItemContent>
          <Switcher.ItemLabel>Globex</Switcher.ItemLabel>
          <Switcher.ItemDescription>Member</Switcher.ItemDescription>
        </Switcher.ItemContent>
        <Switcher.ItemTrailing>…</Switcher.ItemTrailing>
      </Switcher.Item>
    </Switcher.Group>
  </Switcher.Popup>
</Switcher.Root>
`,
    },
  ],
  related: ['Avatar', 'Popover', 'Card'],
} satisfies ComponentDoc<{
  'Switcher.Root': SwitcherRootProps;
  'Switcher.Trigger': SwitcherTriggerProps;
  'Switcher.Popup': SwitcherPopupProps;
  'Switcher.Header': SwitcherHeaderProps;
  'Switcher.Avatar': SwitcherAvatarProps;
  'Switcher.BadgedAvatar': SwitcherBadgedAvatarProps;
  'Switcher.Group': SwitcherGroupProps;
  'Switcher.Separator': SwitcherSeparatorProps;
  'Switcher.Item': SwitcherItemProps;
  'Switcher.ItemMedia': SwitcherItemMediaProps;
  'Switcher.ItemContent': SwitcherItemContentProps;
  'Switcher.ItemLabel': SwitcherItemLabelProps;
  'Switcher.ItemDescription': SwitcherItemDescriptionProps;
  'Switcher.ItemTrailing': SwitcherItemTrailingProps;
}>;
