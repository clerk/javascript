export type ComponentGroup = 'Primitives' | 'Subcomponents' | 'Features';
export const GROUP_LABELS: Record<ComponentGroup, string> = {
  Features: 'Bundled',
  Subcomponents: 'Subcomponents',
  Primitives: 'Primitives',
};
export const GROUP_ORDER: ComponentGroup[] = ['Features', 'Subcomponents', 'Primitives'];
export type ComponentMeta = {
  slug: string;
  title: string;
  group: ComponentGroup;
  description: string;
  tags: string[];
  thumbWidth: number;
  center: boolean;
  snippet: string;
  modal?: boolean;
  frame?: boolean;
};
export const COMPONENT_META: ComponentMeta[] = [
  {
    slug: 'button',
    title: 'Button',
    group: 'Primitives',
    tags: ['Actions', 'Forms'],
    description: 'Filled, outline, ghost and link buttons in four sizes and three colors.',
    thumbWidth: 420,
    center: true,
    snippet: `import { Button } from '@clerk/mosaic/components/button';

<Button>Click me</Button>`,
  },
  {
    slug: 'badge',
    title: 'Badge',
    group: 'Primitives',
    tags: ['Display', 'Status'],
    description: 'A compact status label in primary, neutral, warning, negative or positive.',
    thumbWidth: 420,
    center: true,
    snippet: `import { Badge } from '@clerk/mosaic/components/badge';

<Badge color='positive'>Active</Badge>`,
  },
  {
    slug: 'banner',
    title: 'Banner',
    group: 'Primitives',
    tags: ['Feedback', 'Status'],
    description: 'An inline message with a label and description, colored by intent.',
    thumbWidth: 520,
    center: true,
    snippet: `import { Banner } from '@clerk/mosaic/components/banner';

<Banner.Root color='warning'>
  <Banner.Label>Warning banner</Banner.Label>
  <Banner.Description>Your payment could not be processed.</Banner.Description>
</Banner.Root>`,
  },
  {
    slug: 'avatar',
    title: 'Avatar',
    group: 'Primitives',
    tags: ['Identity', 'Display'],
    description: 'An image with a fallback for when the image is missing or still loading.',
    thumbWidth: 320,
    center: true,
    snippet: `import { Avatar } from '@clerk/mosaic/components/avatar';

<Avatar.Root>
  <Avatar.Image src='/avatar.png' alt='@clerk' />
  <Avatar.Fallback>CL</Avatar.Fallback>
</Avatar.Root>`,
  },
  {
    slug: 'switch',
    title: 'Switch',
    group: 'Primitives',
    tags: ['Forms', 'Settings'],
    description: 'A toggle for settings that take effect immediately.',
    thumbWidth: 320,
    center: true,
    snippet: `import { Switch } from '@clerk/mosaic/components/switch';

<Switch aria-label='Notifications' defaultChecked />`,
  },
  {
    slug: 'user-button',
    title: '<UserButton />',
    group: 'Features',
    tags: ['Authentication', 'Multi-tenancy'],
    description:
      'The signed-in avatar and the menu behind it: switch organization or account, open the profile, sign out.',
    thumbWidth: 520,
    center: true,
    frame: false,
    snippet: `import { UserButton } from '@clerk/mosaic';

<UserButton />`,
  },
  {
    slug: 'user-profile',
    title: '<UserProfile />',
    group: 'Features',
    tags: ['Authentication', 'Billing', 'Security'],
    description: 'Profile, security and billing for the signed-in user, in one navigable view.',
    thumbWidth: 1100,
    center: false,
    modal: true,
    snippet: `import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

<UserProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />`,
  },
  {
    slug: 'organization-profile',
    title: '<OrganizationProfile />',
    group: 'Features',
    tags: ['Multi-tenancy', 'Billing', 'Roles'],
    description: 'Members, invitations, API keys and settings for an organization.',
    thumbWidth: 1100,
    center: false,
    modal: true,
    snippet: `import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

<OrganizationProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />`,
  },
  {
    slug: 'api-keys-table',
    title: '<APIKeysTable />',
    group: 'Subcomponents',
    tags: ['Authentication', 'Developers'],
    description: 'List, create and revoke API keys for a user or an organization.',
    thumbWidth: 900,
    center: true,
    snippet: `import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';

<APIKeysTableView {...props} />`,
  },
];
export const getComponentMeta = (slug: string) => COMPONENT_META.find(item => item.slug === slug);
