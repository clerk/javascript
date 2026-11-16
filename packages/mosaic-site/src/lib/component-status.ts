export type ComponentStatus = 'done' | 'available' | 'in-progress' | 'not-yet';

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
    status: 'done',
    renamedTo: 'Switcher',
    notes: 'Defaults to combined mode.\nLimit: does not support custom pages yet',
  },
  {
    stable: 'UserProfile',
    beta: 'UserProfile',
    status: 'in-progress',
    renamedTo: 'Profile mode="user"',
  },
  { stable: 'UserAvatar', beta: 'UserAvatar', status: 'done' },
  {
    stable: 'OrganizationSwitcher',
    beta: 'OrganizationSwitcher',
    status: 'available',
    renamedTo: 'Switcher',
  },
  {
    stable: 'OrganizationProfile',
    beta: 'OrganizationProfile',
    status: 'in-progress',
    renamedTo: 'Profile',
  },
  {
    stable: 'SignIn',
    beta: 'SignIn',
    status: 'in-progress',
  },
  { stable: 'CreateOrganization', beta: 'CreateOrganization', status: 'in-progress' },
  { stable: 'OrganizationList', beta: 'OrganizationList', status: 'in-progress' },
  { stable: 'Waitlist', beta: 'Waitlist', status: 'done' },
  {
    stable: 'APIKeys',
    beta: 'APIKeys',
    status: 'available',
  },
  { stable: 'OAuthConsent', beta: 'OAuthConsent', status: 'in-progress', renamedTo: 'Consent' },
  { stable: 'TaskChooseOrganization', beta: 'TaskChooseOrganization', status: 'in-progress' },
  { stable: 'TaskSetupMFA', beta: 'TaskSetupMFA', status: 'done' },
  { stable: 'SignInButton', beta: 'SignInButton', status: 'done' },
  { stable: 'SignUpButton', beta: 'SignUpButton', status: 'done' },
  { stable: 'SignOutButton', beta: 'SignOutButton', status: 'done' },
  { stable: 'SignInWithMetamaskButton', beta: 'SignInWithMetamaskButton', status: 'done' },
  { stable: 'InviteMembersButton', beta: 'InviteMembersButton', status: 'done' },
  { stable: 'SignUp', beta: null, status: 'not-yet' },
  { stable: 'PricingTable', beta: null, status: 'not-yet' },
  { stable: 'GoogleOneTap', beta: null, status: 'not-yet' },
  { stable: 'OAuthDeviceVerification', beta: null, status: 'not-yet' },
  { stable: 'TaskResetPassword', beta: null, status: 'not-yet' },
];
