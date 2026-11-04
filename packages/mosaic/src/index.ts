'use client';

export type { OAuthConsentProps } from './features/oauth-consent/oauth-consent';
export { OAuthConsent } from './features/oauth-consent/oauth-consent';
export type { SwitcherProps } from './features/switcher/switcher';
export { Switcher } from './features/switcher/switcher';
export type { UserButtonProps } from './features/user-button/user-button';
export { UserButton } from './features/user-button/user-button';
export type { UserAvatarProps } from './features/user-avatar/user-avatar';
export { UserAvatar } from './features/user-avatar/user-avatar';
export type { OrganizationSwitcherProps } from './features/organization-switcher/organization-switcher';
export { OrganizationSwitcher } from './features/organization-switcher/organization-switcher';
export type { OrganizationProfileProps } from './features/organization-profile/organization-profile';
export { OrganizationProfile } from './features/organization-profile/organization-profile';
export type { ProfileProps } from './features/profile/profile';
export { Profile } from './features/profile/profile';
export type { UserProfileProps } from './features/user-profile/user-profile';
export { UserProfile } from './features/user-profile/user-profile';
export type { MosaicProfile } from './features/profile-pages/use-mosaic-profile';
export { MosaicProvider } from './mosaic-provider';
export type { PortalContainer, PortalProviderProps } from './primitives/portal';
export { PortalProvider } from './primitives/portal';

// CI cache probe, reverted in this PR
