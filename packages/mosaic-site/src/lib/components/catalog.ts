import { NAV_SECTIONS } from '@/lib/components/nav';
import { STORY_COMPONENTS } from '@/lib/components/stories';

export type Kind = 'components' | 'blocks';
export type CatalogItem = { slug: string; title: string; description: string; soon: boolean; children?: CatalogItem[] };
export type CatalogGroup = { label: string; items: CatalogItem[] };
export type CatalogCategory = { id: string; label: string; groups: CatalogGroup[] };

export const KINDS: { id: Kind; label: string; blurb: string }[] = [
  {
    id: 'blocks',
    label: 'Blocks',
    blurb: 'Flows and larger pieces you drop in and ship, with the parts inside each one.',
  },
  {
    id: 'components',
    label: 'Components',
    blurb: 'The styled pieces everything is built from: buttons, inputs and more.',
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const simple = (label: string, names: string[], description: string): CatalogCategory => ({
  id: slugify(label),
  label,
  groups: [
    {
      label: '',
      items: names.map(name => ({
        slug: slugify(name),
        title: name,
        description,
        soon: !STORY_COMPONENTS[slugify(name)],
      })),
    },
  ],
});

const part = (slug: string, title: string, description: string, soon = false): CatalogItem => ({
  slug,
  title,
  description,
  soon,
});

const PARTS: Record<string, CatalogItem[]> = {
  'user-profile': [
    part('profile-details', 'Profile', 'Name and username, each edited in a dialog.'),
    part('email-addresses', 'Email', 'Add, verify, set primary and remove email addresses.'),
    part('phone-numbers', 'Phone', 'Add and verify phone numbers, and choose a primary.'),
    part('password', 'Password', 'Set or change the password, with live strength feedback.'),
    part('passkeys', 'Passkeys', 'Create, rename and remove passkeys.'),
    part('two-step-verification', '2-step verification', 'Authenticator app, text message and backup codes.'),
    part('active-devices', 'Active devices', 'See signed-in devices and sign out of one or all.'),
    part('connected-accounts', 'Connected accounts', 'Link and unlink social sign-in providers.'),
    part('enterprise-accounts', 'Enterprise accounts', 'Enterprise connections on the user profile.'),
    part('web3-wallets', 'Web3 wallets', 'Web3 wallets on the user profile.'),
    part('danger-zone', 'Danger zone', 'Destructive account actions on the user profile.'),
    part('subscription', 'Subscription', 'The subscription section of the user profile.'),
    part('payment-methods', 'Payment methods', 'The payment methods section of the user profile.'),
    part('billing-history', 'Billing history', 'The billing history section of the user profile.'),
    part('api-keys-table', 'API keys table', 'List, create and revoke API keys.'),
  ],
  'organization-profile': [
    part('organization-details', 'Organization details', 'Logo, name and slug of the organization.'),
    part('organization-danger-zone', 'Danger zone', 'Destructive organization actions.'),
  ],
};

const BLOCK_ITEMS: Record<string, { title: string; description: string }> = {
  'user-button': { title: 'Switcher', description: 'The signed-in avatar and the menu behind it.' },
  'user-profile': { title: 'Profile', description: 'Profile, security and billing for the signed-in user.' },
  'user-avatar': { title: 'User avatar', description: 'The signed-in user’s avatar.' },
  'sign-in': { title: 'Sign in', description: 'The sign-in flow.' },
  waitlist: { title: 'Waitlist', description: 'Join the waitlist with an email address.' },
  'task-setup-mfa': { title: 'Setup MFA', description: 'The set up MFA session task.' },
  'organization-switcher': { title: 'Organization switcher', description: 'Switch the active organization.' },
  'organization-list': { title: 'Organization list', description: 'Choose, join or create an organization.' },
  'create-organization': { title: 'Create organization', description: 'Create an organization.' },
  'organization-profile': { title: 'Organization profile', description: 'General, members and API keys.' },
  'invite-members-button': { title: 'Invite members button', description: 'Invite people to an organization.' },
  'task-choose-organization': {
    title: 'Task: choose organization',
    description: 'The choose organization session task.',
  },
  'oauth-consent': { title: 'OAuth consent', description: 'Approve or deny an OAuth request.' },
};

const flows: CatalogCategory[] = NAV_SECTIONS.map(section => ({
  id: slugify(section.label),
  label: section.label,
  groups: [
    {
      label: '',
      items: section.groups
        .flatMap(group => group.slugs)
        .map(slug => ({
          slug,
          ...BLOCK_ITEMS[slug],
          soon: false,
          ...(PARTS[slug] ? { children: PARTS[slug] } : {}),
        })),
    },
  ],
}));

const blockGroups: CatalogCategory[] = [
  simple(
    'Actions',
    [
      'Button',
      'Action bar',
      'Copy button',
      'Provider button',
      'Sign in button',
      'Sign up button',
      'Sign out button',
      'Sign in with MetaMask button',
    ],
    'Something the user presses to make a thing happen.',
  ),
  simple(
    'Inputs',
    [
      'Input',
      'Input group',
      'Field',
      'Checkbox',
      'Radio',
      'Switch',
      'Select',
      'Combobox',
      'Tag input',
      'Phone input',
      'OTP',
      'Segmented control',
    ],
    'A control the user fills in or chooses with.',
  ),
  simple(
    'Display',
    [
      'Avatar',
      'Badge',
      'Banner',
      'Card',
      'Item',
      'Data list',
      'Table',
      'Heading',
      'Text',
      'Separator',
      'Skeleton',
      'Empty state',
      'Entity',
      'Icon',
      'Icon frame',
      'Profile',
      'Visually hidden',
    ],
    'Content the user reads and scans.',
  ),
  simple('Overlays', ['Dialog', 'Drawer', 'Popover', 'Menu', 'Tooltip', 'Toast'], 'A layer that sits above the page.'),
  simple('Navigation', ['Tabs', 'Pagination', 'Section', 'Panel', 'Flow', 'Reveal'], 'Moves the user through a view.'),
  simple(
    'Patterns',
    ['Confirmation', 'Destructive', 'Reverification'],
    'A step that checks the user before it goes on.',
  ),
];

const pieces: CatalogCategory[] = [
  {
    id: 'all',
    label: 'Components',
    groups: [
      {
        label: '',
        items: blockGroups
          .flatMap(category => category.groups.flatMap(group => group.items))
          .sort((a, b) => a.title.localeCompare(b.title)),
      },
    ],
  },
];

export const CATALOG: Record<Kind, CatalogCategory[]> = { blocks: flows, components: pieces };

export const kindOf = (pathname: string): Kind | null =>
  KINDS.find(kind => pathname === `/${kind.id}` || pathname.startsWith(`/${kind.id}/`))?.id ?? null;
export const getCategory = (kind: Kind, id: string) => CATALOG[kind].find(category => category.id === id);
export const allItems = (kind: Kind): CatalogItem[] =>
  CATALOG[kind].flatMap(category =>
    category.groups.flatMap(group => group.items.flatMap(item => [item, ...(item.children ?? [])])),
  );
export const getItem = (kind: Kind, slug: string) => allItems(kind).find(item => item.slug === slug);
export const availableParts = () =>
  CATALOG.blocks
    .flatMap(category => category.groups.flatMap(group => group.items))
    .flatMap(item => item.children ?? [])
    .filter(child => !child.soon);
export const findPart = (slug: string) => {
  const parent = CATALOG.blocks
    .flatMap(category => category.groups.flatMap(group => group.items))
    .find(item => item.children?.some(child => child.slug === slug));
  const item = parent?.children?.find(child => child.slug === slug);
  return parent && item ? { parent, item } : null;
};
