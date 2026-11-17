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
import type { SwitcherTriggerProps } from './switcher-trigger';

export default {
  name: 'Switcher',
  description:
    "The account and organization switcher's parts: the trigger, the popover's header, and its rows. `UserButton`, `OrganizationSwitcher` and `Switcher` from `@clerk/mosaic` compose them with Clerk's session and organization state.",
  useFor: [
    'a custom account or organization switcher composed from its parts',
    'switcher rows or a switcher trigger rendered with your own data',
  ],
  keywords: ['switcher', 'user button', 'organization switcher', 'account switcher', 'menu rows'],
  practices: [
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
      text: 'Build a working account menu from these parts. Use `UserButton` or `OrganizationSwitcher`, which read Clerk and open the popover.',
    },
  ],
  parts: {
    'Switcher.Trigger': {
      description:
        "The trigger's look on a plain `button`, without the popover it opens. With a `name` it shows the name, the badge and a caret; without one, the avatar alone.",
      slot: 'cl-switcher-trigger',
      props: {
        avatar: { type: 'ReactNode', doc: "The lead's mark, such as a `Switcher.BadgedAvatar`." },
        name: { type: 'string', doc: "The lead's name. Leave it out for the avatar-only trigger." },
        badge: { type: 'string', doc: 'A plan or status label beside the name.' },
        shape: {
          type: "'circle' | 'square'",
          doc: 'Rounds the avatar-only trigger to match a circular avatar.',
          default: "'square'",
        },
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
      title: 'A header and one organization row',
      code: `
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
  </Switcher.Item>
</Switcher.Group>
`,
    },
  ],
  related: ['Avatar', 'Popover', 'Card'],
} satisfies ComponentDoc<{
  'Switcher.Trigger': SwitcherTriggerProps;
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
