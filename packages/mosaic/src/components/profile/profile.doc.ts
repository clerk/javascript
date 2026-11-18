import type { ComponentDoc } from '../../docs-schema';
import type {
  ProfileContentPanelProps,
  ProfileContentProps,
  ProfileNavGroupProps,
  ProfileNavItemProps,
  ProfileNavProps,
  ProfileRootProps,
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
  ],
  keywords: ['profile', 'settings', 'navigation', 'sidebar', 'tabs', 'user profile', 'organization profile'],
  practices: [
    { do: true, text: 'Render a `Profile.Title`. It names the nav, and stays visually hidden.' },
    {
      do: true,
      text: 'Give each `Profile.NavItem` a `value` that matches a `Profile.ContentPanel`, and pass the selected page name as `pageTitle`.',
    },
    { do: true, text: 'Pass a string as a `Profile.NavItem` child, so it names the option when the nav is a select.' },
    {
      do: false,
      text: 'Render a `Panel.Title` inside `Profile.ContentPanel` and expect it to show. `Profile.Content` renders the page title.',
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
      description: 'The scrolling page area. Renders the page title, then its children.',
      slot: 'cl-profile-content',
      props: { pageTitle: { type: 'React.ReactNode', doc: 'The selected page name, shown as the page title.' } },
    },
    'Profile.ContentPanel': {
      description: 'One page, shown while its `value` is selected. Sets the heading level one below the page title.',
      slot: 'cl-profile-content-panel',
      props: { value: { type: 'string', doc: 'The page it shows for. Matches a `Profile.NavItem` value.' } },
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
  <Profile.Content pageTitle={titles[page]}>
    <Profile.ContentPanel value='account'>…</Profile.ContentPanel>
    <Profile.ContentPanel value='security'>…</Profile.ContentPanel>
  </Profile.Content>
</Profile.Root>
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
}>;
