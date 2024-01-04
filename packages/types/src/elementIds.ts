export type AlertId = 'danger' | 'warning';
export type FieldId =
  | 'firstName'
  | 'lastName'
  | 'name'
  | 'slug'
  | 'emailAddress'
  | 'phoneNumber'
  | 'currentPassword'
  | 'newPassword'
  | 'signOutOfOtherSessions'
  | 'password'
  | 'confirmPassword'
  | 'identifier'
  | 'username'
  | 'code'
  | 'role'
  | 'deleteConfirmation'
  | 'deleteOrganizationConfirmation'
  | 'enrollmentMode'
  | 'affiliationEmailAddress'
  | 'deleteExistingInvitationsSuggestions';
export type ProfileSectionId =
  | 'profile'
  | 'username'
  | 'emailAddresses'
  | 'phoneNumbers'
  | 'connectedAccounts'
  | 'enterpriseAccounts'
  | 'web3Wallets'
  | 'password'
  | 'mfa'
  | 'danger'
  | 'activeDevices'
  | 'organizationProfile'
  | 'organizationDanger'
  | 'organizationDomains'
  | 'manageVerifiedDomains';
export type ProfilePageId = 'account' | 'security' | 'organizationGeneral' | 'organizationMembers';

export type UserPreviewId = 'userButton' | 'personalWorkspace';
export type OrganizationPreviewId =
  | 'organizationSwitcherTrigger'
  | 'organizationList'
  | 'organizationSwitcherListedOrganization'
  | 'organizationSwitcherActiveOrganization';

export type FooterActionId = 'havingTrouble' | 'alternativeMethods' | 'signUp' | 'signIn';

export type MenuId = 'invitation' | 'member';
export type SelectId = 'countryCode' | 'role';
