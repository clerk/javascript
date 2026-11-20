import type { ComponentDoc } from '../../docs-schema';
import type {
  ProfileContentPanelProps,
  ProfileContentProps,
  ProfileNavGroupProps,
  ProfileNavItemProps,
  ProfileNavProps,
  ProfileRootProps,
  ProfileSubPageProps,
  ProfileTitleProps,
} from './profile';

export default {
  name: 'Profile',
  description:
    'A surface you navigate: a column of pages beside the page each one opens, as tabs. When narrow, the nav becomes a select on the page title, then a sheet on a phone. Inside a `Dialog` it adds the close control.',
  useFor: [
    'a user or organization profile with several pages',
    'a settings surface with side navigation',
    'a tabbed page layout that collapses on small screens',
    'a page that opens sub-pages with a back button',
  ],
  keywords: ['profile', 'settings', 'navigation', 'sidebar', 'tabs', 'user profile', 'organization profile'],
  practices: [
    { do: true, text: 'Render a `Profile.Title`. It names the nav, and stays visually hidden.' },
    {
      do: true,
      text: 'Give each `Profile.NavItem` a `value` that matches a `Profile.ContentPanel`, and start each page with a `Panel.Title`, its page title.',
    },
    { do: true, text: 'Pass a string as a `Profile.NavItem` child, so it names the option when the nav is a select.' },
    {
      do: true,
      text: 'For a page with sub-pages, give its `Profile.ContentPanel` a `label`, `subPage` and `onSubPageChange`, and wrap every view in a `Profile.SubPage`, the page itself as `value={null}`.',
    },
    {
      do: true,
      text: 'Open a sub-page from a panel through a callback prop, such as `onManagePasskeys`, so the panel also works on its own.',
    },
    {
      do: false,
      text: 'Wrap a sub-page in your own `Flow`. `Profile.ContentPanel` moves between its sub-pages and focuses the new title.',
    },
  ],
  parts: {
    'Profile.Root': {
      description: 'Holds the selected page and the nav layout. Renders a `div`, or the `render` element.',
      slot: 'cl-profile',
      props: {
        value: { type: 'string', doc: 'The selected page.' },
        onValueChange: { type: '(value: string) => void', doc: 'Called with the page the user picks.' },
        orientation: { type: "TabsProps['orientation']", doc: 'Tab arrow-key direction.', default: "'vertical'" },
        activationMode: {
          type: "TabsProps['activationMode']",
          doc: 'Whether focusing a tab selects it. The sheet nav always uses `manual`.',
        },
        renderBranding: { type: 'boolean', doc: 'Shows Clerk branding in the wide layout.', default: 'true' },
        elevation: {
          type: 'ProfileElevation',
          doc: '`card` draws a card. `flush` sits inline in the page; inside a `Dialog` it stays `card`.',
          default: "'card'",
        },
      },
    },
    'Profile.Title': {
      description: 'A visually hidden heading at the current level that names the profile and its nav.',
      slot: 'cl-profile-title',
    },
    'Profile.Nav': {
      description:
        'A `nav` of `Profile.NavItem`s or `Profile.NavGroup`s. Renders as a tablist, the options of the page title select, or a tablist in a sheet.',
      slot: 'cl-profile-nav',
    },
    'Profile.NavGroup': {
      description: 'A labelled run of nav items. As tabs the label describes each item; as options it names the group.',
      slot: 'cl-profile-nav-group',
      props: { label: { type: 'React.ReactNode', doc: 'The group name, shown above its items.' } },
    },
    'Profile.NavItem': {
      description: 'One page in the nav, as a tab or an option.',
      slot: 'cl-profile-nav-item',
      props: {
        value: { type: 'string', doc: 'The page it opens.' },
        icon: { type: 'React.ReactNode', doc: 'A leading icon, hidden from assistive tech.' },
        badge: { type: 'React.ReactNode', doc: 'A trailing `Badge`. Badges in it default to `neutral`.' },
        disabled: { type: 'boolean', doc: 'Disables the item.' },
      },
    },
    'Profile.Content': {
      description:
        "The scrolling page area. Each page's `Panel.Title` is its page title, and the navigation's trigger on compact layouts.",
      slot: 'cl-profile-content',
    },
    'Profile.ContentPanel': {
      description: 'One page, shown while its `value` is selected. Sets the heading level one below the page title.',
      slot: 'cl-profile-content-panel',
      props: {
        value: { type: 'string', doc: 'The page it shows for. Matches a `Profile.NavItem` value.' },
        label: {
          type: 'string',
          doc: "The page's name, shown on the back button of each of its sub-pages. Required with `subPage`.",
        },
        subPage: {
          type: 'string | null',
          doc: 'The open sub-page, or `null` for the page itself. Matches a `Profile.SubPage` value. Leave it out for a page without sub-pages.',
        },
        onSubPageChange: {
          type: '(subPage: string | null) => void',
          doc: 'Called with `null` when the user goes back to the page. Required with `subPage`.',
        },
      },
    },
    'Profile.SubPage': {
      description:
        'One view of a `Profile.ContentPanel` with sub-pages, shown while its `value` is the open `subPage`, in a `Flow.Step`. A sub-page\'s `Panel.Title` gets a small back button above it, read as "Back to {label}", and never opens the navigation on compact layouts.',
      props: {
        value: { type: 'string | null', doc: 'The sub-page it shows for, or `null` for the page itself.' },
      },
    },
  },
  examples: [
    {
      title: 'A two-page profile',
      code: `
<Profile.Root value={page} onValueChange={setPage}>
  <Profile.Title>User profile</Profile.Title>
  <Profile.Nav>
    <Profile.NavItem value='account'>Account</Profile.NavItem>
    <Profile.NavItem value='security'>Security</Profile.NavItem>
  </Profile.Nav>
  <Profile.Content>
    <Profile.ContentPanel value='account'>
      <Panel.Root>
        <Panel.Title>Account</Panel.Title>
        …
      </Panel.Root>
    </Profile.ContentPanel>
    <Profile.ContentPanel value='security'>…</Profile.ContentPanel>
  </Profile.Content>
</Profile.Root>
`,
    },
    {
      title: 'A page with a sub-page',
      code: `
<Profile.ContentPanel value='security' label='Security' subPage={subPage} onSubPageChange={setSubPage}>
  <Profile.SubPage value={null}>
    <SecurityPanel onManagePasskeys={() => setSubPage('passkeys')} />
  </Profile.SubPage>
  <Profile.SubPage value='passkeys'>
    <PasskeysPanel />
  </Profile.SubPage>
</Profile.ContentPanel>
`,
    },
  ],
  related: ['Panel', 'Dialog', 'Tabs'],
} satisfies ComponentDoc<{
  'Profile.Root': ProfileRootProps;
  'Profile.Title': ProfileTitleProps;
  'Profile.Nav': ProfileNavProps;
  'Profile.NavGroup': ProfileNavGroupProps;
  'Profile.NavItem': ProfileNavItemProps;
  'Profile.Content': ProfileContentProps;
  'Profile.ContentPanel': ProfileContentPanelProps;
  'Profile.SubPage': ProfileSubPageProps;
}>;
