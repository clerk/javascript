export type ComponentGroup = 'Features';
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
  comingSoon?: boolean;
};
export const COMPONENT_META: ComponentMeta[] = [
  {
    slug: 'user-button',
    title: 'Switcher',
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
    title: 'Profile',
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
    slug: 'combined-profile',
    title: 'Profile',
    group: 'Features',
    tags: ['Authentication', 'Multi-tenancy'],
    description: 'Profile, security and billing for the signed-in user, with the organization alongside.',
    thumbWidth: 1100,
    center: false,
    modal: true,
    comingSoon: true,
    snippet: `import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

<UserProfileView activePage={activePage} pages={pages} organization={{ pages: organizationPages }} onPageChange={setActivePage} />`,
  },
  {
    slug: 'organization-profile',
    title: 'Organization profile',
    group: 'Features',
    tags: ['Multi-tenancy', 'Billing', 'Roles'],
    description: 'Members, invitations, API keys and settings for an organization.',
    thumbWidth: 1100,
    center: false,
    modal: true,
    comingSoon: true,
    snippet: `import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

<OrganizationProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />`,
  },
  {
    slug: 'organization-switcher',
    title: 'Organization switcher',
    group: 'Features',
    tags: ['Multi-tenancy', 'Navigation'],
    description:
      'The active organization and the menu behind it: switch organization, join one, create one, open its settings.',
    thumbWidth: 520,
    center: true,
    frame: false,
    snippet: `import { OrganizationSwitcher } from '@clerk/mosaic';

<OrganizationSwitcher />`,
  },
  {
    slug: 'organization-list',
    title: 'Organization list',
    group: 'Features',
    comingSoon: true,
    tags: ['Multi-tenancy', 'Onboarding'],
    description: 'Choose an organization to continue with, accept an invitation or suggestion, or create a new one.',
    thumbWidth: 520,
    center: true,
    frame: false,
    snippet: `import { OrganizationList } from '@clerk/mosaic/features/organization-list/organization-list';

<OrganizationList />`,
  },
  {
    slug: 'create-organization',
    title: 'Create organization',
    group: 'Features',
    tags: ['Multi-tenancy', 'Onboarding'],
    description: 'Name a new organization, choose its slug, and invite the first members.',
    thumbWidth: 700,
    center: true,
    frame: false,
    snippet: `import { CreateOrganization } from '@clerk/mosaic/features/create-organization/create-organization';

<CreateOrganization />`,
  },
  {
    slug: 'waitlist',
    title: 'Waitlist',
    group: 'Features',
    comingSoon: true,
    tags: ['Authentication', 'Onboarding'],
    description: "Collect an email address for the application's waitlist, then thank the user.",
    thumbWidth: 520,
    center: true,
    frame: false,
    snippet: `import { Waitlist } from '@clerk/mosaic/features/waitlist/waitlist';

<Waitlist />`,
  },
];
export const getComponentMeta = (slug: string) => COMPONENT_META.find(item => item.slug === slug);
