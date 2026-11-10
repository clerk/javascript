export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description?: string;
};
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string }
  | { type: 'props'; rows: PropRow[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'example'; id: string; title?: string; caption?: string }
  | { type: 'prompt'; text: string };
export type DocSection = {
  title: string;
  level?: 2 | 3;
  blocks: DocBlock[];
};
const colors = (...values: string[]) => values.map(value => `'${value}'`).join(' | ');
export const DOCS: Record<string, DocSection[]> = {
  'user-profile': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'The complete user profile: a `Profile` whose navigation lists the Account, Security, Billing and API Keys pages it was given content for, then any pages of your own, in the order you ask for.',
        },
        {
          type: 'p',
          text: 'Rendered below a page, as the preview above is, it is unframed, flush with the page and scrolling with it. Rendered over the page it names the dialog, carries its dismiss and fills its height.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic UserProfileView from '@clerk/mosaic/features/user-profile/user-profile.view' to a page of the app, rendered with activePage, pages and onPageChange wired to local state and elevation set to 'flush'.",
        },
        {
          type: 'code',
          code: `import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

<UserProfileView
  activePage={activePage}
  pages={pages}
  onPageChange={setActivePage}
  elevation='flush'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'activePage',
              type: 'string',
              description: "The open page: a built-in page's id, or a custom page's `path`.",
            },
            { name: 'pages', type: 'UserProfilePages', description: 'The content for each built-in page.' },
            { name: 'onPageChange', type: '(page) => void' },
            {
              name: 'customPages',
              type: 'CustomProfilePage[]',
              description: 'Pages of your own, added after the built-ins.',
            },
            {
              name: 'pageOrder',
              type: 'string[]',
              description:
                'The order the navigation runs in. Ids left out keep their default place behind the ones named.',
            },
            {
              name: 'organization',
              type: 'OrganizationProfilePageListOptions',
              description: "Adds the organization's pages in a group of their own.",
            },
            { name: 'label', type: 'string', description: 'Names the surface, and the dialog it opens in.' },
            { name: 'elevation', type: "'flush'", description: 'Unframes the profile so it sits flush with the page.' },
          ],
        },
        {
          type: 'p',
          text: '`apiKeysProps` configures the API Keys page: `hide` leaves it out of the navigation, and `perPage` and `showDescription` pass through to its `APIKeysTable`.',
        },
      ],
    },
    {
      title: 'Composition',
      blocks: [
        {
          type: 'table',
          head: ['Page', 'Holds'],
          rows: [
            [
              '`Account`',
              'Profile picture, name and username, email addresses, phone numbers, connected accounts and Web3 wallets.',
            ],
            ['`Security`', 'Password, passkeys, two-step verification, active devices and the danger zone.'],
            ['`Billing`', 'The subscription, payment methods and billing history.'],
            ['`API Keys`', 'An `APIKeysTable` for the signed-in user.'],
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'As an overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `profile` dialog, opened from a trigger on the page. The dialog positions and animates the popup. The profile paints it, names it and carries the dismiss.',
        },
        { type: 'example', id: 'overlay' },
        {
          type: 'code',
          code: `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
  <Dialog.Popup variant='profile'>
    <UserProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />
  </Dialog.Popup>
</Dialog.Root>`,
        },
      ],
    },
    {
      title: 'As a full screen overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `fullscreen` dialog, which fills the viewport. A back button above the navigation dismisses it in place of the corner close button.',
        },
        { type: 'example', id: 'fullscreen' },
      ],
    },
    {
      title: 'Compact layout',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "Below `48rem` of the profile's own width the frame goes and the navigation leaves the column: the page title grows a caret and opens it.",
        },
        {
          type: 'list',
          items: [
            'On a viewport of `40rem` or more, the title is a `Select` trigger and the pages are its options.',
            'On a phone, the title opens a `Drawer` holding the navigation. Try the mobile preview above.',
          ],
        },
      ],
    },
  ],
  'organization-profile': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'The organization profile: a `Profile` whose navigation lists the General, Members, Security, Billing and API Keys pages it was given content for, then any pages of your own, in the order you ask for.',
        },
        {
          type: 'p',
          text: 'The Members panel owns its table tabs, including Members, Invitations and Requests. Security and Billing hold their place with a placeholder.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic OrganizationProfileView from '@clerk/mosaic/features/organization-profile/organization-profile.view' to a page of the app, rendered with activePage, pages and onPageChange wired to local state and elevation set to 'flush'.",
        },
        {
          type: 'code',
          code: `import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

<OrganizationProfileView
  activePage={activePage}
  pages={pages}
  onPageChange={setActivePage}
  elevation='flush'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'activePage',
              type: 'string',
              description: "The open page: a built-in page's id, or a custom page's `path`.",
            },
            { name: 'pages', type: 'OrganizationProfilePages', description: 'The content for each built-in page.' },
            { name: 'onPageChange', type: '(page) => void' },
            {
              name: 'customPages',
              type: 'CustomProfilePage[]',
              description: 'Pages of your own, added after the built-ins.',
            },
            { name: 'pageOrder', type: 'string[]', description: 'The order the navigation runs in.' },
            { name: 'label', type: 'string', description: 'Names the surface, and the dialog it opens in.' },
            { name: 'elevation', type: "'flush'", description: 'Unframes the profile so it sits flush with the page.' },
          ],
        },
        {
          type: 'p',
          text: '`apiKeysProps` configures the API Keys page: `hide` leaves it out of the navigation, and `perPage` and `showDescription` pass through to its `APIKeysTable`.',
        },
      ],
    },
    {
      title: 'Composition',
      blocks: [
        {
          type: 'table',
          head: ['Page', 'Holds'],
          rows: [
            ['`General`', 'The logo, name and slug, and the danger zone for leaving or deleting the organization.'],
            ['`Members`', 'Tabs for members, invitations and membership requests.'],
            ['`API Keys`', 'An `APIKeysTable` for the organization.'],
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'As an overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `profile` dialog, opened from a trigger on the page. The dialog positions and animates the popup. The profile paints it, names it and carries the dismiss.',
        },
        { type: 'example', id: 'overlay' },
        {
          type: 'code',
          code: `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Manage organization</Dialog.Trigger>
  <Dialog.Popup variant='profile'>
    <OrganizationProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />
  </Dialog.Popup>
</Dialog.Root>`,
        },
      ],
    },
    {
      title: 'As a full screen overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `fullscreen` dialog, which fills the viewport. A back button above the navigation dismisses it in place of the corner close button.',
        },
        { type: 'example', id: 'fullscreen' },
      ],
    },
    {
      title: 'Compact layout',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "Below `48rem` of the profile's own width the navigation moves behind the page title. On a viewport of `40rem` or more it opens as a listbox under the title, and on a phone it opens as a sheet.",
        },
      ],
    },
  ],
  'organization-switcher': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: "`OrganizationSwitcher` is the active organization's avatar and the menu behind it: switch organization or back to the personal account, join a suggested or invited organization, create one, invite members, and open the organization's settings.",
        },
        {
          type: 'p',
          text: 'It reads the active session and organization from Clerk, so it takes no data. It renders nothing when nobody is signed in or the instance has organizations turned off.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic OrganizationSwitcher from '@clerk/mosaic' to the app header and render it as <OrganizationSwitcher />. Enable Organizations in the Clerk Dashboard first.",
        },
        {
          type: 'code',
          code: `import { OrganizationSwitcher } from '@clerk/mosaic';

<OrganizationSwitcher />`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'hidePersonal',
              type: 'boolean',
              default: 'false',
              description: 'Leaves the personal account out of the list, so only organizations can be picked.',
            },
            {
              name: 'organizationProfileUrl',
              type: 'string',
              description: 'Routes Manage organization to a page of your own.',
            },
            {
              name: 'createOrganizationUrl',
              type: 'string',
              description: 'Routes Create organization to a page of your own.',
            },
            {
              name: 'afterSelectOrganizationUrl',
              type: 'string | ((organization) => string)',
              description:
                'Where switching organization lands. Takes a `:param` template, a plain path, or a function.',
            },
            {
              name: 'afterSelectPersonalUrl',
              type: 'string',
              description: 'Where switching to the personal account lands.',
            },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Rendered while Clerk is still answering.',
            },
          ],
        },
      ],
    },
  ],
  'organization-list': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`OrganizationList` is a card listing the accounts the signed-in user can continue as: their personal account, the organizations they belong to, and the organizations they are invited to or may request to join. Selecting one makes it active.',
        },
        {
          type: 'p',
          text: 'Where the user may create organizations, a button opens the create-organization flow in place of the list.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic OrganizationList from '@clerk/mosaic/features/organization-list/organization-list' to a page of the app and render it as <OrganizationList />. Enable Organizations in the Clerk Dashboard first.",
        },
        {
          type: 'code',
          code: `import { OrganizationList } from '@clerk/mosaic/features/organization-list/organization-list';

<OrganizationList />`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'hidePersonal',
              type: 'boolean',
              default: 'false',
              description: 'Leaves the personal account out of the list.',
            },
            {
              name: 'skipInvitationScreen',
              type: 'boolean',
              default: 'false',
              description: 'Skips the invite step after creating an organization.',
            },
            {
              name: 'afterCreateOrganizationUrl',
              type: 'string',
              description: 'Where a newly created organization lands.',
            },
            {
              name: 'afterSelectOrganizationUrl',
              type: 'string | ((organization) => string)',
              description: 'Where selecting an organization lands.',
            },
            {
              name: 'afterSelectPersonalUrl',
              type: 'string',
              description: 'Where selecting the personal account lands.',
            },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Rendered while Clerk is still answering.',
            },
          ],
        },
      ],
    },
  ],
  'create-organization': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`CreateOrganization` is a form that creates an organization: a logo, a name and, where the instance uses them, a slug. The new organization becomes the active one.',
        },
        {
          type: 'p',
          text: 'Unless `skipInvitationScreen` is set, or the organization can hold only one member, the next step invites members to it.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic CreateOrganization from '@clerk/mosaic/features/create-organization/create-organization' to a page of the app and render it as <CreateOrganization />. Enable Organizations in the Clerk Dashboard first.",
        },
        {
          type: 'code',
          code: `import { CreateOrganization } from '@clerk/mosaic/features/create-organization/create-organization';

<CreateOrganization />`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'skipInvitationScreen',
              type: 'boolean',
              default: 'false',
              description: 'Skips the invite step after the organization is created.',
            },
            {
              name: 'afterCreateOrganizationUrl',
              type: 'string',
              description: 'Where the new organization lands.',
            },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Rendered while Clerk is still answering.',
            },
          ],
        },
      ],
    },
  ],
  waitlist: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: "`Waitlist` is a card that collects an email address and adds it to the application's waitlist, then thanks the user. It reads the application from Clerk, so it takes no data.",
        },
        { type: 'p', text: 'An `email_address` query parameter fills in the field.' },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Waitlist } from '@clerk/mosaic/features/waitlist/waitlist';

<Waitlist />`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'afterJoinWaitlistUrl',
              type: 'string',
              description: 'Sends the user on two seconds after they join.',
            },
            {
              name: 'signInUrl',
              type: 'string',
              description: "Where the Sign in link goes. Defaults to the application's sign-in URL.",
            },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Rendered while Clerk is still answering.',
            },
          ],
        },
      ],
    },
  ],
  'user-button': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: "`UserButton` is the signed-in user's avatar and the menu behind it: switch organization, switch or add an account, open the profile, and sign out. It reads the active session and organization from Clerk, so it takes no data.",
        },
        {
          type: 'p',
          text: 'The active organization heads the menu, badged with the account. Under it sit the organizations the account belongs to, plus suggested and invited ones it can join, then Settings and Invite members. Switch account at the foot opens the signed-in accounts as a flyout, so an account never reads as an organization.',
        },
        {
          type: 'p',
          text: 'Each action is a request: the row you click spins, the others stand down, and the menu stays open on the result. Only an action that navigates closes it. Try the preview above, where nothing is instant.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'prompt',
          text: "Set up Clerk in this project if it is not already installed: add @clerk/nextjs or the Clerk SDK that matches the framework, wrap the app in the Clerk provider and configure the publishable key and secret key from the Clerk Dashboard. Then add the Mosaic UserButton from '@clerk/mosaic' to the app header and render it as <UserButton />.",
        },
        {
          type: 'code',
          code: `import { UserButton } from '@clerk/mosaic';

<UserButton />`,
        },
        {
          type: 'p',
          text: "Pass a URL to route to a page of your own instead of opening Clerk's modal. That is the whole opt-in.",
        },
        {
          type: 'code',
          code: `<UserButton
  userProfileUrl='/account'
  organizationProfileUrl='/settings/organization'
  afterSelectOrganizationUrl='/orgs/:slug'
  afterSwitchSessionUrl='/dashboard'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'mode',
              type: colors('combined', 'user'),
              default: "'combined'",
              description: 'Which switchers the popup carries: both, or accounts alone.',
            },
            {
              name: 'triggerVariant',
              type: colors('full', 'condensed'),
              default: "'full'",
              description:
                "How much the trigger carries. `full` badges the organization with the account; `condensed` shows the lead's avatar alone.",
            },
            {
              name: 'showTriggerLabel',
              type: 'boolean',
              default: 'true',
              description: 'Set to `false` to leave the avatar alone, without the name.',
            },
            {
              name: 'triggerBadge',
              type: 'boolean | (({ kind, id }) => Promise<{ id, label } | null>)',
              default: 'true',
              description: 'Hide the badge, or supply an async function that decides which badge to show.',
            },
            { name: 'userProfileUrl', type: 'string', description: 'Routes Manage profile to a page of your own.' },
            {
              name: 'organizationProfileUrl',
              type: 'string',
              description: 'Routes Manage organization to a page of your own.',
            },
            {
              name: 'afterSelectOrganizationUrl',
              type: 'string | ((organization) => string)',
              description:
                'Where switching organization lands. Takes a `:param` template, a plain path, or a function.',
            },
            { name: 'afterSwitchSessionUrl', type: 'string', description: 'Where switching account lands.' },
            {
              name: 'fallback',
              type: 'ReactNode',
              description:
                'Holds the space while Clerk is still answering. Size it to the trigger so the row it sits in does not move.',
            },
          ],
        },
      ],
    },
    {
      title: 'Modes',
      blocks: [
        {
          type: 'p',
          text: "`mode` picks which switchers the surface carries. It is the only prop that changes the popup's shape, and everything else is data. What a mode leads with is named in the trigger and heads the popup, so the two always agree.",
        },
        {
          type: 'table',
          head: ['Mode', 'Popup', 'Leads with'],
          rows: [
            ['`combined`', 'Organizations and accounts together.', 'The active organization, badged with the account.'],
            ['`user`', 'Accounts only. Never shows an organization.', 'The account.'],
          ],
        },
        {
          type: 'p',
          text: 'For organizations alone, use `OrganizationSwitcher`.',
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'Condensed trigger',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: '`triggerVariant="condensed"` makes the trigger smaller and drops the account\'s badge. `user` mode is always condensed.',
        },
        { type: 'example', id: 'condensed' },
      ],
    },
    {
      title: 'Avatar only',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "`showTriggerLabel={false}` leaves the avatar alone. A user's avatar on its own rounds the trigger fully to match it.",
        },
        { type: 'example', id: 'iconOnly' },
      ],
    },
    {
      title: 'User only',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The account heads the menu and no organizations are listed, so Settings, then Switch account and Sign out at the foot, are the whole of it.',
        },
        { type: 'example', id: 'userOnly' },
      ],
    },
    {
      title: 'Single session',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'An instance in single-session mode holds one account at a time, so there is nothing to switch to and no second account to add. The menu withholds Switch account, Add account and Sign out of all accounts, and keeps Sign out.',
        },
        { type: 'example', id: 'singleSession' },
      ],
    },
  ],
};
