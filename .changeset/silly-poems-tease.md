---
'@clerk/backend': major
---

Drop deprecated properties. Migration steps:
- use `createClerkClient` instead of `__unstable_options`
- use `publishableKey` instead of `frontendApi`
- use `clockSkewInMs` instead of  `clockSkewInSeconds`
- use `apiKey` instead of  `secretKey`
- drop `httpOptions`
- use `*.image` instead of
    - `ExternalAccount.picture`
    - `ExternalAccountJSON.avatar_url`
    - `Organization.logoUrl`
    - `OrganizationJSON.logo_url`
    - `User.profileImageUrl`
    - `UserJSON.profile_image_url`
    - `OrganizationMembershipPublicUserData.profileImageUrl`
    - `OrganizationMembershipPublicUserDataJSON.profile_image_url`
- drop `pkgVersion`
- use `Organization.getOrganizationInvitationList` with // TODO
- drop `orgs` claim (if required, can be manually added by using `user.organizations` in a jwt template)
- use `localInterstitial` instead of `remotePublicInterstitial` / `remotePublicInterstitialUrl`

Internal changes:
- replaced error enum (and it's) `SetClerkSecretKeyOrAPIKey` with `SetClerkSecretKey`
