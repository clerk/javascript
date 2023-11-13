---
'@clerk/chrome-extension': major
'@clerk/clerk-js': major
'@clerk/nextjs': major
'@clerk/shared': major
'@clerk/clerk-react': major
'@clerk/types': major
'@clerk/clerk-expo': major
---

Drop deprecations. Migration steps:
- use `publishableKey` instead of `frontendApi`
- use `Clerk.handleEmailLinkVerification()` instead of `Clerk.handleMagicLinkVerification()`
- use `isEmailLinkError` instead of `isMagicLinkError`
- use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
- use `useEmailLink` instead of `useMagicLink`
- drop `orgs` jwt claim from session token
- use `ExternalAccount.imageUrl` instead of `ExternalAccount.avatarUrl`
- use `Organization.imageUrl` instead of `Organization.logoUrl`
- use `User.imageUrl` instead of `User.profileImageUrl`
- use `OrganizationMembershipPublicUserData.imageUrl` instead of `OrganizationMembershipPublicUserData.profileImageUrl`
- use `useOrganizationList` instead of `useOrganizations`
- use `userProfileProps` instead of `userProfile` in `Appearance`
- use `Clerk.setActive()` instead of `Clerk.setSession()`
- drop `password` param in `User.update()`
- use `afterSelectOrganizationUrl` instead of `afterSwitchOrganizationUrl` in `OrganizationSwitcher`
- drop `Clerk.experimental_canUseCaptcha` / `Clerk.Clerk.experimental_captchaSiteKey` / `Clerk.experimental_captchaURL` (were meant for internal use)
- use `User.getOrganizationMemberships()` instead of `Clerk.getOrganizationMemberships()`
- drop `lastOrganizationInvitation` / `lastOrganizationMember` from Clerk emitted events
- drop `Clerk.__unstable__invitationUpdate` / `Clerk.__unstable__membershipUpdate`
- drop support for string param in `Organization.create()`
- use `Organization.getInvitations()` instead of `Organization.getPendingInvitations()`
- use `pageSize` instead of `limit` in `OrganizationMembership.retrieve()`
- use `initialPage` instead of `offset` in `OrganizationMembership.retrieve()`
- drop `lastOrganizationInvitation` / `lastOrganizationMember` from ClerkProvider
- use `invitations` instead of `invitationList` in `useOrganization`
- use `memberships` instead of `membershipList` in `useOrganization`
- use `redirectUrl` instead of `redirect_url` in `User.createExternalAccount()`
- use `signature` instead of `generatedSignature` in `Signup.attemptWeb3WalletVerification()`
