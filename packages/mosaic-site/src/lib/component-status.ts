export type ComponentStatus = 'available' | 'in-progress' | 'not-yet';

export type ComponentRow = {
  stable: string;
  beta: string | null;
  status: ComponentStatus;
  renamedTo?: string;
  notes?: string;
};

export const COMPONENT_STATUS: ComponentRow[] = [
  {
    stable: 'UserButton',
    beta: 'UserButton',
    status: 'available',
    renamedTo: 'Switcher',
    notes:
      '`mode` is now `combined`, and profile props and URLs move to `MosaicProvider`. No `href` link items in `customPages`.',
  },
  {
    stable: 'UserProfile',
    beta: 'UserProfile',
    status: 'available',
    renamedTo: 'Profile mode="user"',
    notes: 'No path or hash routing yet, so URLs don’t update. `defaultPage` is removed; use `pageOrder`.',
  },
  { stable: 'UserAvatar', beta: 'UserAvatar', status: 'available' },
  {
    stable: 'OrganizationSwitcher',
    beta: 'OrganizationSwitcher',
    status: 'available',
    notes:
      'Profile props and URLs move to `MosaicProvider`. `afterLeaveOrganizationUrl` moves to `profile.organizationProfileProps`.',
  },
  {
    stable: 'OrganizationProfile',
    beta: 'OrganizationProfile',
    status: 'available',
    notes: 'No path or hash routing yet, so URLs don’t update. `defaultPage` is removed; use `pageOrder`.',
  },
  {
    stable: 'SignIn',
    beta: 'SignIn',
    status: 'in-progress',
    notes: 'Screens are built but not yet available as a drop-in component.',
  },
  { stable: 'CreateOrganization', beta: 'CreateOrganization', status: 'in-progress' },
  { stable: 'OrganizationList', beta: 'OrganizationList', status: 'in-progress' },
  { stable: 'Waitlist', beta: 'Waitlist', status: 'in-progress' },
  {
    stable: 'APIKeys',
    beta: 'APIKeys',
    status: 'in-progress',
    notes: 'Only inside the `UserProfile` and `OrganizationProfile` API keys pages for now.',
  },
  { stable: 'OAuthConsent', beta: 'OAuthConsent', status: 'in-progress' },
  { stable: 'TaskChooseOrganization', beta: 'TaskChooseOrganization', status: 'in-progress' },
  { stable: 'TaskSetupMFA', beta: 'TaskSetupMFA', status: 'in-progress' },
  { stable: 'SignInButton', beta: 'SignInButton', status: 'in-progress' },
  { stable: 'SignUpButton', beta: 'SignUpButton', status: 'in-progress' },
  { stable: 'SignOutButton', beta: 'SignOutButton', status: 'in-progress' },
  { stable: 'SignInWithMetamaskButton', beta: 'SignInWithMetamaskButton', status: 'in-progress' },
  { stable: 'InviteMembersButton', beta: 'InviteMembersButton', status: 'in-progress' },
  { stable: 'SignUp', beta: null, status: 'not-yet' },
  { stable: 'PricingTable', beta: null, status: 'not-yet' },
  { stable: 'GoogleOneTap', beta: null, status: 'not-yet' },
  { stable: 'OAuthDeviceVerification', beta: null, status: 'not-yet' },
  { stable: 'TaskResetPassword', beta: null, status: 'not-yet' },
];
