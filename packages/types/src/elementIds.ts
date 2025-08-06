export type AlertId = 'danger' | 'warning' | 'info';
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
  | 'passkeyName'
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
  | 'deleteExistingInvitationsSuggestions'
  | 'legalAccepted'
  | 'apiKeyDescription'
  | 'apiKeyExpirationDate'
  | 'apiKeyRevokeConfirmation';
export type ProfileSectionId =
  | 'profile'
  | 'username'
  | 'emailAddresses'
  | 'phoneNumbers'
  | 'connectedAccounts'
  | 'enterpriseAccounts'
  | 'web3Wallets'
  | 'password'
  | 'passkeys'
  | 'mfa'
  | 'danger'
  | 'activeDevices'
  | 'organizationProfile'
  | 'organizationDanger'
  | 'organizationDomains'
  | 'manageVerifiedDomains'
  | 'subscriptionsList'
  | 'paymentSources';
export type ProfilePageId = 'account' | 'security' | 'organizationGeneral' | 'organizationMembers' | 'billing';

export type UserPreviewId = 'userButton' | 'personalWorkspace';
export type OrganizationPreviewId =
  | 'organizationSwitcherTrigger'
  | 'organizationList'
  | 'organizationSwitcherListedOrganization'
  | 'organizationSwitcherActiveOrganization'
  | 'taskChooseOrganization';

export type CardActionId =
  | 'havingTrouble'
  | 'alternativeMethods'
  | 'signUp'
  | 'signIn'
  | 'usePasskey'
  | 'waitlist'
  | 'signOut';

export type MenuId = 'invitation' | 'member' | ProfileSectionId;
export type SelectId = 'countryCode' | 'role' | 'paymentSource' | 'apiKeyExpiration';
