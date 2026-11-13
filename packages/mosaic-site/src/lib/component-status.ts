export type ComponentStatus = 'available' | 'in-progress' | 'not-yet';

export type ComponentRow = { stable: string; beta: string | null; status: ComponentStatus };

export const COMPONENT_STATUS: ComponentRow[] = [
  { stable: 'UserButton', beta: 'UserButton', status: 'available' },
  { stable: 'UserProfile', beta: 'UserProfile', status: 'available' },
  { stable: 'UserAvatar', beta: 'UserAvatar', status: 'available' },
  { stable: 'OrganizationSwitcher', beta: 'OrganizationSwitcher', status: 'available' },
  { stable: 'OrganizationProfile', beta: 'OrganizationProfile', status: 'available' },
  { stable: 'SignIn', beta: 'SignIn', status: 'in-progress' },
  { stable: 'CreateOrganization', beta: 'CreateOrganization', status: 'in-progress' },
  { stable: 'OrganizationList', beta: 'OrganizationList', status: 'in-progress' },
  { stable: 'Waitlist', beta: 'Waitlist', status: 'in-progress' },
  { stable: 'APIKeys', beta: 'APIKeys', status: 'in-progress' },
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
