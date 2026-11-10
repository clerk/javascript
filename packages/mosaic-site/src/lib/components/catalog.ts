import { ROADMAP } from '@/lib/components/roadmap';
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

const FLOW_GROUPS: { id: string; label: string; slugs: string[] }[] = [
  { id: 'account', label: 'Account', slugs: ['user-profile', 'user-button'] },
  {
    id: 'authentication',
    label: 'Authentication',
    slugs: ['sign-in', 'sign-up', 'google-one-tap', 'waitlist', 'task-reset-password', 'task-setup-mfa'],
  },
  {
    id: 'organizations',
    label: 'Organizations',
    slugs: ['organization-list', 'create-organization', 'task-choose-organization'],
  },
  {
    id: 'billing',
    label: 'Billing',
    slugs: ['pricing-table', 'plan-details', 'checkout', 'subscription-details'],
  },
  { id: 'ai', label: 'AI', slugs: ['oauth-consent', 'agent-approval'] },
];

const part = (slug: string, title: string, description: string, soon = false): CatalogItem => ({
  slug,
  title,
  description,
  soon,
});

const planned = (title: string): CatalogItem => part(slugify(title), title, '', true);

const PARTS: Record<string, CatalogItem[]> = {
  'user-profile': [
    part('avatar-upload', 'Avatar upload', 'Picker, drop target and remove menu for a profile picture.'),
    part('profile-details', 'Profile details', 'Name and username, each edited in a dialog.'),
    part('email-addresses', 'Email addresses', 'Add, verify, set primary and remove email addresses.'),
    part('phone-numbers', 'Phone numbers', 'Add and verify phone numbers, and choose a primary.'),
    part('connected-accounts', 'Connected accounts', 'Link and unlink social sign-in providers.'),
    part('password', 'Password', 'Set or change the password, with live strength feedback.'),
    part('passkeys', 'Passkeys', 'Create, rename and remove passkeys.'),
    part('two-step-verification', 'Two-step verification', 'Authenticator app, text message and backup codes.'),
    part('active-devices', 'Active devices', 'See signed-in devices and sign out of one or all.'),
    part('api-keys', 'API keys', 'Create, copy and revoke API keys.'),
    ...['Members', 'Invitations', 'Roles'].map(planned),
  ],
};

const flows: CatalogCategory[] = FLOW_GROUPS.map(group => ({
  id: group.id,
  label: group.label,
  groups: [
    {
      label: '',
      items: group.slugs
        .map(slug => ROADMAP.find(item => item.slug === slug))
        .filter(item => item !== undefined)
        .map(item => ({
          slug: item.slug,
          title: item.title,
          description: '',
          soon: item.status === 'soon',
          ...(PARTS[item.slug] ? { children: PARTS[item.slug] } : {}),
        }))
        .sort((a, b) => Number(a.soon) - Number(b.soon)),
    },
  ],
}));

const blockGroups: CatalogCategory[] = [
  simple(
    'Actions',
    [
      'Button',
      'Action bar',
      'Action menu',
      'Copy button',
      'Link',
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
      'Spinner',
      'Empty state',
    ],
    'Content the user reads and scans.',
  ),
  simple('Overlays', ['Dialog', 'Drawer', 'Popover', 'Menu', 'Tooltip', 'Toast'], 'A layer that sits above the page.'),
  simple('Navigation', ['Tabs', 'Pagination', 'Section', 'Panel', 'Stepper'], 'Moves the user through a view.'),
  simple(
    'Patterns',
    ['Confirm', 'Destructive action', 'Reverification'],
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
