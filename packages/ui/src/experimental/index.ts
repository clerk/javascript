// Flat named exports for the composed profile API.
//
// Each component is a top-level named export (not a property on a namespace
// object) so React Server Components create a client reference for it. That lets
// consumers render these directly in a Server Component tree without adding their
// own `'use client'` boundary. A namespace object (`UserProfile.Account`) would
// expose only the object as a client reference and break property access across
// the RSC boundary.
export {
  UserProfileProvider,
  UserProfileAccountPanel,
  UserProfileSecurityPanel,
  UserProfileBillingPanel,
  UserProfileAPIKeysPanel,
  UserProfileProfileSection,
  UserProfileUsernameSection,
  UserProfileEmailSection,
  UserProfilePhoneSection,
  UserProfileConnectedAccountsSection,
  UserProfileEnterpriseAccountsSection,
  UserProfileWeb3Section,
  UserProfilePasswordSection,
  UserProfilePasskeysSection,
  UserProfileMfaSection,
  UserProfileActiveDevicesSection,
  UserProfileDeleteSection,
  OrganizationProfileProvider,
  OrganizationProfileGeneralPanel,
  OrganizationProfileMembersPanel,
  OrganizationProfileBillingPanel,
  OrganizationProfileAPIKeysPanel,
  OrganizationProfileConfigureSSOPanel,
  OrganizationProfileProfileSection,
  OrganizationProfileDomainsSection,
  OrganizationProfileLeaveSection,
  OrganizationProfileDeleteSection,
} from '../composed';
