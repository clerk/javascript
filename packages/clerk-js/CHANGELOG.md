# Change Log

## 4.64.0

### Minor Changes

- Greatly improve the UX when users are creating their passwords. The hints below the input fields now have smoother animations and show more types of feedback based on different conditions. Additionally, the password validation is now debounced. ([#1776](https://github.com/clerkinc/javascript/pull/1776)) by [@desiprisg](https://github.com/desiprisg)

## 4.63.0

### Minor Changes

- Introduce customization in `UserProfile` and `OrganizationProfile` ([#1822](https://github.com/clerkinc/javascript/pull/1822)) by [@anagstef](https://github.com/anagstef)

  The `<UserProfile />` component now allows the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<UserProfile.Page>` component, and external links can be added using the `<UserProfile.Link>` component. The default routes, such as `Account` and `Security`, can be reordered.

  Example React API usage:

  ```tsx
  <UserProfile>
    <UserProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </UserProfile.Page>
    <UserProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <UserProfile.Page label='account' />
    <UserProfile.Page label='security' />
  </UserProfile>
  ```

  Custom pages and links should be provided as children using the `<UserButton.UserProfilePage>` and `<UserButton.UserProfileLink>` components when using the `UserButton` component.

  The `<OrganizationProfile />` component now supports the addition of custom pages and external links to the navigation sidebar. Custom pages can be created using the `<OrganizationProfile.Page>` component, and external links can be added using the `<OrganizationProfile.Link>` component. The default routes, such as `Members` and `Settings`, can be reordered.

  Example React API usage:

  ```tsx
  <OrganizationProfile>
    <OrganizationProfile.Page
      label='Custom Page'
      url='custom'
      labelIcon={<CustomIcon />}
    >
      <MyCustomPageContent />
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label='External'
      url='/home'
      labelIcon={<Icon />}
    />
    <OrganizationProfile.Page label='members' />
    <OrganizationProfile.Page label='settings' />
  </OrganizationProfile>
  ```

  Custom pages and links should be provided as children using the `<OrganizationSwitcher.OrganizationProfilePage>` and `<OrganizationSwitcher.OrganizationProfileLink>` components when using the `OrganizationSwitcher` component.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerkinc/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Keep `CreateOrganizationForm` disabled in case of an uploaded avatar and organization name is empty. ([#1910](https://github.com/clerkinc/javascript/pull/1910)) by [@nikospapcom](https://github.com/nikospapcom)

- Drop `experimental_force_oauth_first` & `experimental__forceOauthFirst` from `DisplayConfig` ([#1918](https://github.com/clerkinc/javascript/pull/1918)) by [@dimkl](https://github.com/dimkl)

- Consider `Clerk.setActive` as stable. ([#1917](https://github.com/clerkinc/javascript/pull/1917)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`3bf64107e`](https://github.com/clerkinc/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`734dc52af`](https://github.com/clerkinc/javascript/commit/734dc52af2ea8c214d617aa5c4065a66471c9f48), [`52f8553d2`](https://github.com/clerkinc/javascript/commit/52f8553d22f9454ee1194fd162410db15da7a4be), [`92727eec3`](https://github.com/clerkinc/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerkinc/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerkinc/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`aa4cd7615`](https://github.com/clerkinc/javascript/commit/aa4cd761585b888706a36a6eed7436a8f0476dbf)]:
  - @clerk/localizations@1.26.7
  - @clerk/shared@1.0.0
  - @clerk/types@3.57.0

## 4.62.1

### Patch Changes

- Added `formFieldInputPlaceholder__password` to the placeholder of the password input in the `<SignInFactorOnePasswordCard/>` component ([#1909](https://github.com/clerkinc/javascript/pull/1909)) by [@octoper](https://github.com/octoper)

- Internal fix for deprecation warning when using limi & offset. ([#1904](https://github.com/clerkinc/javascript/pull/1904)) by [@panteliselef](https://github.com/panteliselef)

- Remove custom Alert from invitation page and display it as a global error instead (at the top of the component). ([#1903](https://github.com/clerkinc/javascript/pull/1903)) by [@panteliselef](https://github.com/panteliselef)

- Deprecate experimental captcha from Clerk singleton. ([#1905](https://github.com/clerkinc/javascript/pull/1905)) by [@panteliselef](https://github.com/panteliselef)

- Append query params for sign-in and sign-up initial values after the hash in order to be readable via hash routing. ([#1855](https://github.com/clerkinc/javascript/pull/1855)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`ccfb0e8ed`](https://github.com/clerkinc/javascript/commit/ccfb0e8ed43c7857bfd5cb4dcb732fe6cf2d40d5), [`9ca215702`](https://github.com/clerkinc/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/localizations@1.26.6
  - @clerk/types@3.56.1

## 4.62.0

### Minor Changes

- Introduces three new element appearence descriptors: ([#1803](https://github.com/clerkinc/javascript/pull/1803)) by [@octoper](https://github.com/octoper)

  - `tableHead` let's you customize the tables head styles.
  - `paginationButton` let's you customize the pagination buttons.
  - `paginationRowText` let's you customize the pagination text.

- Add new `/sign-up/continue/verify-phone-number` and `/sign-up/continue/verify-email-address` routes in order to allow navigating back to the `/sign-up/continue` step when editing the extra identifier that is provided in the `/sign-up/continue` step. ([#1870](https://github.com/clerkinc/javascript/pull/1870)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Improve accessibility of `<UserButton />` and `<OrganizationSwitcher />` by using `aria-*` attributes (where appropriate) and roles like `menu` and `menuitem`. ([#1826](https://github.com/clerkinc/javascript/pull/1826)) by [@panteliselef](https://github.com/panteliselef)

- Update default organization permissions with a `sys_` prefix as part of the entitlement. This changes makes it easy to distinguish between clerk reserved permissions and custom permissions created by developers. ([#1865](https://github.com/clerkinc/javascript/pull/1865)) by [@mzhong9723](https://github.com/mzhong9723)

- Mark the following SAML related types as stable: ([#1876](https://github.com/clerkinc/javascript/pull/1876)) by [@dimkl](https://github.com/dimkl)

  - `User.samlAccounts`
  - `SamlAccount`
  - `UserSettingsResource.saml`
  - `UserSettingsJSON.saml`
  - `SamlSettings`
  - `UserResource.samlAccounts`
  - `SamlAccountResource`
  - `SamlStrategy`
  - `UserJSON.saml_accounts`
  - `SamlAccountJSON`
  - `SamlConfig`
  - `SamlFactor`
  - `HandleSamlCallbackParams`

- Deprecate the `organization.__unstable__invitationUpdate` and `organization.__unstable__membershipUpdate` methods. ([#1879](https://github.com/clerkinc/javascript/pull/1879)) by [@panteliselef](https://github.com/panteliselef)

- Enforce LTR direction in code inputs ([#1873](https://github.com/clerkinc/javascript/pull/1873)) by [@desiprisg](https://github.com/desiprisg)

- Replace role based check with permission based checks inside the OrganizationSwitcher component. ([#1851](https://github.com/clerkinc/javascript/pull/1851)) by [@panteliselef](https://github.com/panteliselef)

- Update `@emotion/react` from `11.10.5` to `11.11.1` to allow internal usage of TypeScript v5 ([Emotion commit](https://github.com/emotion-js/emotion/commit/9357f337200ef38f9c6df5d4dd7c20772478ea42)) ([#1877](https://github.com/clerkinc/javascript/pull/1877)) by [@LekoArts](https://github.com/LekoArts)

- Replace role based check with permission based checks inside the OrganizationSettings component. ([#1850](https://github.com/clerkinc/javascript/pull/1850)) by [@panteliselef](https://github.com/panteliselef)

- Fix methods in clerk-js that consumede paginated endpoints in order to retrieve single resources. ([#1871](https://github.com/clerkinc/javascript/pull/1871)) by [@panteliselef](https://github.com/panteliselef)

- Fix incorrect deprecation message for `__unstable__membershipUpdate`. ([#1889](https://github.com/clerkinc/javascript/pull/1889)) by [@panteliselef](https://github.com/panteliselef)

- Replace role based check with permission based checks inside the OrganizationMembers component. ([#1849](https://github.com/clerkinc/javascript/pull/1849)) by [@panteliselef](https://github.com/panteliselef)

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerkinc/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`35be8709d`](https://github.com/clerkinc/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerkinc/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerkinc/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`9b644d799`](https://github.com/clerkinc/javascript/commit/9b644d7991b8cba4b385e9443f87798cde5c9989), [`a9894b445`](https://github.com/clerkinc/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`834dadb36`](https://github.com/clerkinc/javascript/commit/834dadb36c30b2a8f052784de4ad1026b0083b4e), [`70f251007`](https://github.com/clerkinc/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerkinc/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0
  - @clerk/shared@0.24.5
  - @clerk/localizations@1.26.5

## 4.61.0

### Minor Changes

- The sign-in form will now switch to the phone input if the only initial value provided was that of the phone number. ([#1861](https://github.com/clerkinc/javascript/pull/1861)) by [@desiprisg](https://github.com/desiprisg)

- Add support for LinkedIn OIDC ([#1772](https://github.com/clerkinc/javascript/pull/1772)) by [@fragoulis](https://github.com/fragoulis)

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerkinc/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)

  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Updated the OAuth buttons in the SignIn and SignUp components to prevent layout shifts while loading. ([#1838](https://github.com/clerkinc/javascript/pull/1838)) by [@octoper](https://github.com/octoper)

- Introduces a new `isAuthorized()` method in the `Session` class. Returns a promise and checks whether the active user is allowed to perform an action based on the passed (required) permission and the ones attached to the membership. ([#1834](https://github.com/clerkinc/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerkinc/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Fix incorrect path of types for the clerk-js headless variant. ([#1848](https://github.com/clerkinc/javascript/pull/1848)) by [@panteliselef](https://github.com/panteliselef)

- Throw an error if the `signInUrl` is on the same origin of a satellite application or if it is of invalid format ([#1845](https://github.com/clerkinc/javascript/pull/1845)) by [@desiprisg](https://github.com/desiprisg)

- Introduces an internal `<Gate/>` component (supporting hook and HOC) which enables us to conditionally render parts of our components based on a users permissions. ([#1834](https://github.com/clerkinc/javascript/pull/1834)) by [@panteliselef](https://github.com/panteliselef)

- Correctly set idle card state when an error occurs during the MFA set up phase. ([#1825](https://github.com/clerkinc/javascript/pull/1825)) by [@desiprisg](https://github.com/desiprisg)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerkinc/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Disable country picker button when form is submitted ([#1853](https://github.com/clerkinc/javascript/pull/1853)) by [@desiprisg](https://github.com/desiprisg)

- Updated dependencies [[`977336f79`](https://github.com/clerkinc/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`997b8e256`](https://github.com/clerkinc/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`7fb229688`](https://github.com/clerkinc/javascript/commit/7fb229688020d51c9b6d1721a9b0d039abe4c59d), [`91e9a55f4`](https://github.com/clerkinc/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerkinc/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerkinc/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/shared@0.24.4
  - @clerk/types@3.55.0
  - @clerk/localizations@1.26.4

## 4.60.1

### Patch Changes

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerkinc/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)

  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Fixes an issue where the phone number value was not properly copied onto the input when pasting on the email or username field in the `<SignIn/>` component after autoswitching to the phone number field. The issue was introduced with the changes for the Prefill `<SignIn/>` and `<SignUp/>` feature. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerkinc/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1136c7c15`](https://github.com/clerkinc/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/shared@0.24.3

## 4.60.0

### Minor Changes

- Introduce a new user resource method to leave an organization. You can now call 'user.leaveOrganization(<org_id>)' when a user chooses to leave an organization instead of 'organization.removeMember(<user_id>)' which is mostly meant for organization based actions. ([#1809](https://github.com/clerkinc/javascript/pull/1809)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- - Introduce organizationProfileProps as prop in `<OrganizationSwitcher/>`. ([#1801](https://github.com/clerkinc/javascript/pull/1801)) by [@panteliselef](https://github.com/panteliselef)

  - Introduce appearance in userProfileProps in `<UserButton/>`.
  - Deprecate the usage of `appearance.userProfile` in `<UserButton/>`.

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerkinc/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Enables you to translate the tooltip hint while creating an organization through the `formFieldHintText__slug` key ([#1811](https://github.com/clerkinc/javascript/pull/1811)) by [@LekoArts](https://github.com/LekoArts)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerkinc/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Fixes a UI bug on Safari, that was causing the border of tables to be displayed incorrectly ([#1814](https://github.com/clerkinc/javascript/pull/1814)) by [@panteliselef](https://github.com/panteliselef)

- Warn about `publicUserData.profileImageUrl` nested property deprecation in `OrganizationMembership` & `OrganizationMembershipRequest` resources. ([#1812](https://github.com/clerkinc/javascript/pull/1812)) by [@dimkl](https://github.com/dimkl)

- Fix internal subpath imports by replacing them with top level imports. ([#1804](https://github.com/clerkinc/javascript/pull/1804)) by [@dimkl](https://github.com/dimkl)

- Removes `it.skip` from the LeaveOrganizationPage tests. ([#1820](https://github.com/clerkinc/javascript/pull/1820)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerkinc/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerkinc/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerkinc/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerkinc/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerkinc/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`9514618d6`](https://github.com/clerkinc/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`ccf42105b`](https://github.com/clerkinc/javascript/commit/ccf42105bf20ae55ac03cdaf4e7b3d33913033db), [`c7c6912f3`](https://github.com/clerkinc/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`e3451443e`](https://github.com/clerkinc/javascript/commit/e3451443e5adad2b53e445e990e4ce84170686ab), [`71bb1c7b5`](https://github.com/clerkinc/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0
  - @clerk/localizations@1.26.3
  - @clerk/shared@0.24.2

## 4.59.1

### Patch Changes

- Apply deprecation warnings for `@clerk/clerk-js`: ([#1800](https://github.com/clerkinc/javascript/pull/1800)) by [@dimkl](https://github.com/dimkl)

  - `Clerk.setSession`

- Updated dependencies [[`cecf74d79`](https://github.com/clerkinc/javascript/commit/cecf74d79069662d25f73e4745aa01348d398afb)]:
  - @clerk/shared@0.24.1

## 4.59.0

### Minor Changes

- `<SignIn/>`, `<SignUp/>`, `<RedirectToSignin/>`, `<RedirectToSignUp/>`, `clerk.redirectToSignIn()` and `clerk.redirectToSignUp()` now accept the `initialValues` option, which will prefill the appropriate form fields with the values provided. ([#1701](https://github.com/clerkinc/javascript/pull/1701)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Use our deprecate utility to log warnings about deprecated usage of Organization.getMemberships ([#1779](https://github.com/clerkinc/javascript/pull/1779)) by [@dimkl](https://github.com/dimkl)

- Fix: localized key for invalid email addreses in InviteMembers form. ([#1781](https://github.com/clerkinc/javascript/pull/1781)) by [@panteliselef](https://github.com/panteliselef)

- Apply deprecation warnings clerk-js package for: ([#1779](https://github.com/clerkinc/javascript/pull/1779)) by [@dimkl](https://github.com/dimkl)

  - Organization.create() using string parameter
  - Organization.retrieve() `limit` & `offset`
  - Clerk.getOrganizationMemberships()
  - `svgUrl`
  - `avatarUrl`/`logoUrl`/`faviconUrl`/`profileImageUrl`

- Updated the OAuth buttons in the SignIn and SignUp components to prevent layout shifts while loading. ([#1728](https://github.com/clerkinc/javascript/pull/1728)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`7ffa6fac3`](https://github.com/clerkinc/javascript/commit/7ffa6fac3762f6fb130ba2f2fcaa28e52b36b3b4), [`cc8851765`](https://github.com/clerkinc/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`5c8754239`](https://github.com/clerkinc/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`2f6a6ac99`](https://github.com/clerkinc/javascript/commit/2f6a6ac9991469bf8532019bb22ff50adecdb434), [`753f7bbda`](https://github.com/clerkinc/javascript/commit/753f7bbda9bbb7444f96222a3b6cae815a09058f), [`55c8ebd39`](https://github.com/clerkinc/javascript/commit/55c8ebd390dd88036aee06866009be6a50c63138)]:
  - @clerk/shared@0.24.0
  - @clerk/localizations@1.26.2
  - @clerk/types@3.53.0

## 4.58.2

### Patch Changes

- Safer usage of `localStorage` by checking if `window` is available in current environment ([#1774](https://github.com/clerkinc/javascript/pull/1774)) by [@LekoArts](https://github.com/LekoArts)

- Some minor TypeScript type fixes to internal components. Also applying some ESLint recommendations. ([#1756](https://github.com/clerkinc/javascript/pull/1756)) by [@LekoArts](https://github.com/LekoArts)

- Introduces a new method for fetching organization invitations called `Organization.getInvitations`. ([#1766](https://github.com/clerkinc/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `Organization.getPendingInvitations`

- Adds the ability to force users to reset their password. ([#1757](https://github.com/clerkinc/javascript/pull/1757)) by [@kostaspt](https://github.com/kostaspt)

- Updated dependencies [[`07ede0f95`](https://github.com/clerkinc/javascript/commit/07ede0f959f232f6cbecb596eb9352f8cb382cdc), [`0eb666118`](https://github.com/clerkinc/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`3b85311c9`](https://github.com/clerkinc/javascript/commit/3b85311c9eb006f51a8642f193473a250de879fc), [`ffcc78c06`](https://github.com/clerkinc/javascript/commit/ffcc78c062d067738f617ea9b491c1d45677148c), [`c61ddf5bf`](https://github.com/clerkinc/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerkinc/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/shared@0.23.1
  - @clerk/types@3.52.1
  - @clerk/localizations@1.26.1

## 4.58.1

### Patch Changes

- Fixed a bug where the "Unverified" badge was missing on email or phone number fields when those where marked as "Primary" ([#1749](https://github.com/clerkinc/javascript/pull/1749)) by [@panteliselef](https://github.com/panteliselef)

- Removing the `__clerk_referrer_primary` that was marked as deprecated. It was introduced to support the multi-domain featured, but was replaced shortly after. ([#1755](https://github.com/clerkinc/javascript/pull/1755)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`6706b154c`](https://github.com/clerkinc/javascript/commit/6706b154c0b41356c7feeb19c6340160a06466e5), [`086a2e0b7`](https://github.com/clerkinc/javascript/commit/086a2e0b7e71a9919393ca43efedbf3718ea5fe4)]:
  - @clerk/shared@0.23.0

## 4.58.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerkinc/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Organization.getMemberships now supports paginated responses by passing `{paginated:true}` ([#1708](https://github.com/clerkinc/javascript/pull/1708)) by [@panteliselef](https://github.com/panteliselef)

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerkinc/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Add support for redirecting to "factor-one" during account transfer flow. ([#1696](https://github.com/clerkinc/javascript/pull/1696)) by [@kostaspt](https://github.com/kostaspt)

- Disable role selection for the last admin in OrganizationProfile ([#1721](https://github.com/clerkinc/javascript/pull/1721)) by [@panteliselef](https://github.com/panteliselef)

- This PR replaces `The verification link expired. Please resend it.` message with the localization key `formFieldError__verificationLinkExpired`. The english message was also adjust to `The verification link expired. Please request a new link.` to make the second sentence clearer. ([#1738](https://github.com/clerkinc/javascript/pull/1738)) by [@LekoArts](https://github.com/LekoArts)

- Improve color contrast in Badges ([#1716](https://github.com/clerkinc/javascript/pull/1716)) by [@panteliselef](https://github.com/panteliselef)

- The [issue #1557](https://github.com/clerkinc/javascript/issues/1557) uncovered that when using `@clerk/nextjs` together with `next-intl` the error `"Failed to execute 'removeChild' on 'Node'"` was thrown. ([#1726](https://github.com/clerkinc/javascript/pull/1726)) by [@LekoArts](https://github.com/LekoArts)

  That error came from `@floating-ui/react` which `@clerk/clerk-js` used under the hood. Its version was upgraded from `0.19.0` to `0.25.4` to fix this error.

  This error is probably not isolated to `next-intl` so if you encountered a similar error in the past, try upgrading.

- Fix bug with missing or incorrect breadcrumbs in Organization and User profiles ([#1722](https://github.com/clerkinc/javascript/pull/1722)) by [@panteliselef](https://github.com/panteliselef)

- Fixes minor bug in UI of a success page ([#1725](https://github.com/clerkinc/javascript/pull/1725)) by [@panteliselef](https://github.com/panteliselef)

- Improve spacing consistency OrganizationList ([#1717](https://github.com/clerkinc/javascript/pull/1717)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e6b52ae34`](https://github.com/clerkinc/javascript/commit/e6b52ae34fcfaf3266dde1334a8e95bc00624ee2), [`e99df0a0d`](https://github.com/clerkinc/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerkinc/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`4e16d39f3`](https://github.com/clerkinc/javascript/commit/4e16d39f3e7a10442753d280abf1b9175784f623), [`8b9a7a360`](https://github.com/clerkinc/javascript/commit/8b9a7a36003f1b8622f444a139a811f1c35ca813), [`30bb9eccb`](https://github.com/clerkinc/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`01b024c57`](https://github.com/clerkinc/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerkinc/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974)]:
  - @clerk/localizations@1.26.0
  - @clerk/types@3.52.0
  - @clerk/shared@0.22.1

## 4.57.0

### Minor Changes

- Introduced a new `firstFactorUrl` property in sign-in callback to handle unverified emails. ([#1629](https://github.com/clerkinc/javascript/pull/1629)) by [@kostaspt](https://github.com/kostaspt)

### Patch Changes

- Organization Switcher now diplays organization invitations and suggestions in a more compact form. ([#1675](https://github.com/clerkinc/javascript/pull/1675)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`463ff84f5`](https://github.com/clerkinc/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerkinc/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739), [`060b2bd6b`](https://github.com/clerkinc/javascript/commit/060b2bd6b18ff534736e2abb8a599f2a51308050)]:
  - @clerk/types@3.51.0
  - @clerk/localizations@1.25.2

## 4.56.3

### Patch Changes

- Display a notification counter for admins with pending request in the active organization. The counter is it visible in OrganizationSwitcher and OrganizationProfile ("Requests" tab) ([#1670](https://github.com/clerkinc/javascript/pull/1670)) by [@panteliselef](https://github.com/panteliselef)

- Previously users could leave or delete an organization by submiting the form without the macthing organization name ([#1677](https://github.com/clerkinc/javascript/pull/1677)) by [@panteliselef](https://github.com/panteliselef)

- Support swapping the Clerk publishableKey at runtime to allow users to toggle the instance being used. ([#1655](https://github.com/clerkinc/javascript/pull/1655)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`169bc3d26`](https://github.com/clerkinc/javascript/commit/169bc3d26a0b5422183af07f57da742861225985)]:
  - @clerk/localizations@1.25.1

## 4.56.2

### Patch Changes

- Set SameSite=Lax for dev browser cookie, instead of Strict, so that it can be read from the server after redirects ([#1638](https://github.com/clerkinc/javascript/pull/1638)) by [@yourtallness](https://github.com/yourtallness)

## 4.56.1

### Patch Changes

- Disable chunking for `@clerk/clerk-js/headless` to ensure the library doesn't attempt to dynamically load chunks in a non-browser environment. ([#1654](https://github.com/clerkinc/javascript/pull/1654)) by [@BRKalow](https://github.com/BRKalow)

## 4.56.0

### Minor Changes

- Introducing validatePassword for SignIn and SignUp resources ([#1445](https://github.com/clerkinc/javascript/pull/1445)) by [@panteliselef](https://github.com/panteliselef)

  - Validate a password based on the instance's configuration set in Password Policies in Dashboard

- Introduce a new resource called OrganizationSuggestion along with retrieve() & accept() methods ([#1574](https://github.com/clerkinc/javascript/pull/1574)) by [@chanioxaris](https://github.com/chanioxaris)

  Also make available the user's suggestions from the useOrganizationList hook

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerkinc/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

- Implement Resend OTP functionality as part of the Organization Domain verification flow ([#1583](https://github.com/clerkinc/javascript/pull/1583)) by [@chanioxaris](https://github.com/chanioxaris)

- Introduce `hasImage` in User / Organization / Session resources ([#1544](https://github.com/clerkinc/javascript/pull/1544)) by [@dimkl](https://github.com/dimkl)

- Improve redirects on OAuth callback. Now, if you try to sign up with a provider that allows unverified accounts, it will ([#1563](https://github.com/clerkinc/javascript/pull/1563)) by [@kostaspt](https://github.com/kostaspt)

  navigate to the appropriate change when needed, fixing the broken flow.

- Introduce `logoLinkUrl` prop in `appearance.layout` ([#1449](https://github.com/clerkinc/javascript/pull/1449)) by [@nikospapcom](https://github.com/nikospapcom)

  A new `logoLinkUrl` prop has been added to `appearance.layout` and used in `ApplicationLogo` to change the `href` of the link.
  By default, the logo link url will be the Home URL you've set in the Clerk Dashboard.

### Patch Changes

- Pass dev_browser to AP via query param, fix AP origin detection util ([#1567](https://github.com/clerkinc/javascript/pull/1567)) by [@yourtallness](https://github.com/yourtallness)

- Introduces a new resource called OrganizationMembership ([#1572](https://github.com/clerkinc/javascript/pull/1572)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerkinc/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses. ([#1606](https://github.com/clerkinc/javascript/pull/1606)) by [@panteliselef](https://github.com/panteliselef)

  - userMemberships is now also part of the returned values of useOrganizationList

- Introduces the accept method in UserOrganizationInvitation class ([#1550](https://github.com/clerkinc/javascript/pull/1550)) by [@panteliselef](https://github.com/panteliselef)

- Display a notification counter for organization invitations in OrganizationSwitcher ([#1627](https://github.com/clerkinc/javascript/pull/1627)) by [@panteliselef](https://github.com/panteliselef)

- Introduces a new resource called OrganizationDomain ([#1569](https://github.com/clerkinc/javascript/pull/1569)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces domains and invitations in <OrganizationProfile /> ([#1560](https://github.com/clerkinc/javascript/pull/1560)) by [@panteliselef](https://github.com/panteliselef)

  - The "Members" page now accommodates Domain and Individual invitations
  - The "Settings" page allows for the addition, edit and removal of a domain

- Fix a bug where it was not possible to delete the username if it was optional. ([#1580](https://github.com/clerkinc/javascript/pull/1580)) by [@raptisj](https://github.com/raptisj)

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerkinc/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)

  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

- Ensure the session token is updated when calling `setActive()` in a non-browser environment. ([#1623](https://github.com/clerkinc/javascript/pull/1623)) by [@BRKalow](https://github.com/BRKalow)

- Introduces an invitation list within <OrganizationSwitcher/> ([#1554](https://github.com/clerkinc/javascript/pull/1554)) by [@panteliselef](https://github.com/panteliselef)

  - Users can accept the invitation that is sent to them

- When updating enrollment mode of a domain uses can now delete any pending invitations or suggestions. ([#1632](https://github.com/clerkinc/javascript/pull/1632)) by [@panteliselef](https://github.com/panteliselef)

- Construct urls based on context in <OrganizationSwitcher/> ([#1503](https://github.com/clerkinc/javascript/pull/1503)) by [@panteliselef](https://github.com/panteliselef)

  - Deprecate `afterSwitchOrganizationUrl`
  - Introduce `afterSelectOrganizationUrl` & `afterSelectPersonalUrl`

  `afterSelectOrganizationUrl` accepts

  - Full URL -> 'https://clerk.com/'
  - relative path -> '/organizations'
  - relative path -> with param '/organizations/:id'
  - function that returns a string -> (org) => `/org/${org.slug}`
    `afterSelectPersonalUrl` accepts
  - Full URL -> 'https://clerk.com/'
  - relative path -> '/users'
  - relative path -> with param '/users/:username'
  - function that returns a string -> (user) => `/users/${user.id}`

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerkinc/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

- Updated dependencies [[`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`17b3de961`](https://github.com/clerkinc/javascript/commit/17b3de961096446b66853ef2a0a75dc276d89b16), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e404b98f7`](https://github.com/clerkinc/javascript/commit/e404b98f7339f2f8167684e664153b7d5ac4400e), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`dcabc22c5`](https://github.com/clerkinc/javascript/commit/dcabc22c5ed71094683ac7e1691c1cfa34f59783), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/shared@0.22.0
  - @clerk/types@3.50.0
  - @clerk/localizations@1.25.0

## 4.55.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerkinc/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

- Eliminate pre/post onBlur states for password field and prioritize minimum character count error message over other complexity errors. ([#1531](https://github.com/clerkinc/javascript/pull/1531)) by [@raptisj](https://github.com/raptisj)

- Introduce Clerk.client.clearCache() method ([#1545](https://github.com/clerkinc/javascript/pull/1545)) by [@SokratisVidros](https://github.com/SokratisVidros)

### Patch Changes

- Deprecate usage of old image fields in favor of `imageUrl` ([#1543](https://github.com/clerkinc/javascript/pull/1543)) by [@dimkl](https://github.com/dimkl)

- Introduce the ability to read multiple errors. Used for password complexity errors coming from BE. ([#1505](https://github.com/clerkinc/javascript/pull/1505)) by [@raptisj](https://github.com/raptisj)

- Introduces a new internal class `UserOrganizationInvitation` that represents and invitation to join an organization with the organization data populated ([#1527](https://github.com/clerkinc/javascript/pull/1527)) by [@panteliselef](https://github.com/panteliselef)

  Additions to support the above

  - UserOrganizationInvitationResource
  - UserOrganizationInvitationJSON
  - ClerkPaginatedResponse

  ClerkPaginatedResponse represents a paginated FAPI response

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`be7a18cc0`](https://github.com/clerkinc/javascript/commit/be7a18cc0eff8c31fe17152a9e9efdab9946da72), [`d433b83b9`](https://github.com/clerkinc/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0
  - @clerk/shared@0.21.0
  - @clerk/localizations@1.24.1

## 4.54.2

### Patch Changes

- Updated dependencies [[`30cf15c10`](https://github.com/clerkinc/javascript/commit/30cf15c10c9b47c2b3ba3975bc86856846cf4129)]:
  - @clerk/localizations@1.24.0

## 4.54.1

### Patch Changes

- Introduce the `skipInvitationScreen` prop on `<CreateOrganization />` component ([#1501](https://github.com/clerkinc/javascript/pull/1501)) by [@panteliselef](https://github.com/panteliselef)

- Removes identifier from Personal Workspace in the OrganizationSwitcher list (UI) ([#1502](https://github.com/clerkinc/javascript/pull/1502)) by [@panteliselef](https://github.com/panteliselef)

- - Address spacing issues when password feedback message changes ([#1482](https://github.com/clerkinc/javascript/pull/1482)) by [@raptisj](https://github.com/raptisj)

  - Add a full stop in form feedback(errors and warnings) when needed

- In `<OrganizationProfile />` component, allow an admin to leave the current organization if there are more admins present. ([#1498](https://github.com/clerkinc/javascript/pull/1498)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1
  - @clerk/localizations@1.23.2

## 4.54.0

### Minor Changes

- Add unsafeMetadata prop to the SignUp component ([#1464](https://github.com/clerkinc/javascript/pull/1464)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Experimental support for ESM and CJS for clerk-js ([#1485](https://github.com/clerkinc/javascript/pull/1485)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`73c0f9a29`](https://github.com/clerkinc/javascript/commit/73c0f9a29499f4fea590aae9c4bf4026395f0c12)]:
  - @clerk/types@3.48.0
  - @clerk/localizations@1.23.1

## 4.53.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerkinc/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)

  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

### Patch Changes

- Add missing property 'maxAllowedMemberships' in Organization resource ([#1468](https://github.com/clerkinc/javascript/pull/1468)) by [@chanioxaris](https://github.com/chanioxaris)

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerkinc/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Fixed a bug where overriding some localization values in the sign in/up start pages with an empty string would result in showing the english translation. ([#1474](https://github.com/clerkinc/javascript/pull/1474)) by [@desiprisg](https://github.com/desiprisg)

- Changes to OrganizationSwitcher ([#1462](https://github.com/clerkinc/javascript/pull/1462)) by [@panteliselef](https://github.com/panteliselef)

  - Removal of user identifier from the trigger & popover
  - Hidden avatar of active user when `hidePersonal` is true

- Enable the ability to target the avatar upload and remove action buttons ([#1455](https://github.com/clerkinc/javascript/pull/1455)) by [@tmilewski](https://github.com/tmilewski)

- In the <CreateOrganization /> component, if the newly created organization has max allowed membership equal to 1, skip the invitation page ([#1471](https://github.com/clerkinc/javascript/pull/1471)) by [@chanioxaris](https://github.com/chanioxaris)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerkinc/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`8bd5b3d38`](https://github.com/clerkinc/javascript/commit/8bd5b3d386cbcdf460bf347b76a87f0306934bfd), [`5ecbb0a37`](https://github.com/clerkinc/javascript/commit/5ecbb0a37e99fa2099629c573951c7735d5f0810), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`cd361e169`](https://github.com/clerkinc/javascript/commit/cd361e1698abd58a7eb81290bc86a784333421f1)]:
  - @clerk/types@3.47.0
  - @clerk/localizations@1.23.0
  - @clerk/shared@0.20.0

## 4.52.1

### Patch Changes

- Updated dependencies [[`561a78bd7`](https://github.com/clerkinc/javascript/commit/561a78bd725ba893c229ddcc312573fb52fbd916)]:
  - @clerk/localizations@1.22.1

## 4.52.0

### Minor Changes

- The password field will now autofocus on the sign in factor one page. ([#1447](https://github.com/clerkinc/javascript/pull/1447)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Move UI for deleting account to bottom of user profile component in the security section ([#1407](https://github.com/clerkinc/javascript/pull/1407)) by [@jescalan](https://github.com/jescalan)

## 4.51.0

### Minor Changes

- Navigate to the signUp url if user visits the verify-email-address/verify-phone-number route without the proper identifier present ([#1405](https://github.com/clerkinc/javascript/pull/1405)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c), [`1ce885065`](https://github.com/clerkinc/javascript/commit/1ce885065e7ca548a3306d5f03edeaf7ec709850), [`9ce3cbe41`](https://github.com/clerkinc/javascript/commit/9ce3cbe41f7ce7cb9cd102b45a3626da77062b7d)]:
  - @clerk/types@3.46.1
  - @clerk/localizations@1.22.0

## 4.50.1

### Patch Changes

- Set the `__session` cookie with `samesite:none` for secure iframes only ([#1403](https://github.com/clerkinc/javascript/pull/1403)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`137322862`](https://github.com/clerkinc/javascript/commit/137322862f346f0515ff78090b1c19cadc487d3e), [`741012544`](https://github.com/clerkinc/javascript/commit/741012544a12d34c4e4204626a00f7b1d6a88a05), [`0b55cdf27`](https://github.com/clerkinc/javascript/commit/0b55cdf2766ea2a0eb2dfe7c42c589816d77e077)]:
  - @clerk/localizations@1.21.1

## 4.50.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerkinc/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Support cross-origin iframe to use session cookie ([#1389](https://github.com/clerkinc/javascript/pull/1389)) by [@dimkl](https://github.com/dimkl)

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/localizations@1.21.0
  - @clerk/types@3.46.0

## 4.49.0

### Minor Changes

- If user does not have permission to create an org, create org button will not display in the OrganizationSwitcher UI ([#1373](https://github.com/clerkinc/javascript/pull/1373)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Fix to pull from the correct permissions set when displaying user delete self UI ([#1372](https://github.com/clerkinc/javascript/pull/1372)) by [@jescalan](https://github.com/jescalan)

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/localizations@1.20.1

## 4.48.1

### Patch Changes

- Updated dependencies [[`e67e0fb2`](https://github.com/clerkinc/javascript/commit/e67e0fb29bc850938a17bf981427a7e328fe07ea), [`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/localizations@1.20.0
  - @clerk/types@3.44.0

## 4.48.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerkinc/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Password, first name & last name fields will be disabled if there are active SAML accounts. ([#1326](https://github.com/clerkinc/javascript/pull/1326)) by [@yourtallness](https://github.com/yourtallness)

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6), [`eed73021`](https://github.com/clerkinc/javascript/commit/eed73021b0e3d8fd25f7e58828460d9013e0e689), [`a23a3cc8`](https://github.com/clerkinc/javascript/commit/a23a3cc8dc9ecc3d01188dbd763dc68a74ea06f9)]:
  - @clerk/types@3.43.0
  - @clerk/localizations@1.19.0

## 4.47.2

### Patch Changes

- Optimize all images displayed within the Clerk components, such as Avatars, static OAuth provider assets etc. All images are now resized and compressed. Additionally, all images are automatically converted into more efficient formats (`avif`, `webp`) if they are supported by the user's browser, otherwise all images fall back to `jpeg`. ([#1367](https://github.com/clerkinc/javascript/pull/1367)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`59bc649a`](https://github.com/clerkinc/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/shared@0.19.1

## 4.47.1

### Patch Changes

- Updated dependencies [[`0d5caa84`](https://github.com/clerkinc/javascript/commit/0d5caa84a2808dbd260259a4359d7339b99cfb39)]:
  - @clerk/localizations@1.18.1

## 4.47.0

### Minor Changes

- Add base64 string support in Organization.setLogo ([#1309](https://github.com/clerkinc/javascript/pull/1309)) by [@raptisj](https://github.com/raptisj)

- Fix magic link flows for development instances when url-based session syncing is used. ([#1343](https://github.com/clerkinc/javascript/pull/1343)) by [@alex-ntousias](https://github.com/alex-ntousias)

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerkinc/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`5cde6d80`](https://github.com/clerkinc/javascript/commit/5cde6d8094c7e03dcf4cd4507d815ddb5951f819), [`6f3d4305`](https://github.com/clerkinc/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef)]:
  - @clerk/shared@0.19.0
  - @clerk/types@3.42.0
  - @clerk/localizations@1.18.0

## 4.46.0

### Minor Changes

- Add missing appearance keys for the "Manage Organization" button within `<OrganizationSwitcher/>` by [@nikosdouvlis](https://github.com/nikosdouvlis)

### Patch Changes

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Load CF turnstile from FAPI by [@nikosdouvlis](https://github.com/nikosdouvlis)

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

- Add support for dataURLs in User.setProfileImage by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Support OTP autofill for Chrome on iOS by [@nikosdouvlis](https://github.com/nikosdouvlis)

  - Fixes a bug preventing OTP being correctly autofilled when received via SMS

- Preview known SAML error messages during failed Sign in/up flows by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/localizations@1.17.1
  - @clerk/types@3.41.1
  - @clerk/shared@0.18.0

## [4.45.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.45.0-staging.4...@clerk/clerk-js@4.45.0) (2023-06-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.44.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.44.0-staging.0...@clerk/clerk-js@4.44.0) (2023-05-26)

**Note:** Version bump only for package @clerk/clerk-js

### [4.43.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.43.2-staging.0...@clerk/clerk-js@4.43.2) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

### [4.43.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.43.0...@clerk/clerk-js@4.43.1) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.43.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.43.0-staging.1...@clerk/clerk-js@4.43.0) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.42.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.42.0-staging.1...@clerk/clerk-js@4.42.0) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.41.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.41.0-staging.2...@clerk/clerk-js@4.41.0) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-js

## [4.40.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.40.0-staging.4...@clerk/clerk-js@4.40.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-js

## [4.39.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.39.0-staging.6...@clerk/clerk-js@4.39.0) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-js

## [4.39.0-staging.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.39.0-staging.4...@clerk/clerk-js@4.39.0-staging.5) (2023-05-04)

### Features

- **clerk-js,types:** Support sign in with SAML strategy ([6da395f](https://github.com/clerkinc/javascript/commit/6da395fd785467aa934896942408bdb5f64aa887))
- **clerk-js,types:** Support sign up with SAML strategy ([6d9c93e](https://github.com/clerkinc/javascript/commit/6d9c93e9d782f17bbddde1e68c2ce977415b45db))
- **clerk-js:** Use allowed special characters for password from environment ([dec0512](https://github.com/clerkinc/javascript/commit/dec05120c180e53595e87817a2f44ef62af0f4f1))

### Bug Fixes

- **clerk-js:** Escape `allowed_special_characters` from FAPI ([da6b683](https://github.com/clerkinc/javascript/commit/da6b6833d1351a529f40640e821adbc73d121d13))

## [4.39.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.39.0-staging.2...@clerk/clerk-js@4.39.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Add resetPasswordFlow to SignIn resource ([6155f5b](https://github.com/clerkinc/javascript/commit/6155f5bde6fe0a140bffb7d8087c2246716abf7e))
- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerkinc/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerkinc/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerkinc/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Prepare Reset password field for complexity and strength ([9736d94](https://github.com/clerkinc/javascript/commit/9736d94409593a26546b8a7b1a2dec7c023e61b1))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerkinc/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))
- **clerk-js:** Reset password MFA ([5978756](https://github.com/clerkinc/javascript/commit/5978756640bc5f5bb4726f72ca2e53ba43f009d6))

### Bug Fixes

- **clerk-js,types:** Remove after_sign_out_url as it not returned by FAPI ([#1121](https://github.com/clerkinc/javascript/issues/1121)) ([d87493d](https://github.com/clerkinc/javascript/commit/d87493d13e2c7a3ffbf37ba728e6cde7f6f14682))
- **clerk-js:** Add error when preparing for reset_password_code ([7ac766e](https://github.com/clerkinc/javascript/commit/7ac766eacf5199944c271a87f81c045709ec3aa7))
- **clerk-js:** Allow children to be passed in VerificationCodeCard ([eb556f8](https://github.com/clerkinc/javascript/commit/eb556f8a557c5371a56b0b0b72162fd63e85263f))
- **clerk-js:** Password settings maximum allowed length ([bfcb799](https://github.com/clerkinc/javascript/commit/bfcb7993d156d548f35ee7274e7e023c866c01af))
- **clerk-js:** Remove forgotten console.log ([823a0c0](https://github.com/clerkinc/javascript/commit/823a0c0c2e83cff1e4c2793994c6a4069881b568))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerkinc/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))
- **clerk-js:** Use redirectWithAuth after multi session signOut ([928a206](https://github.com/clerkinc/javascript/commit/928a2067c10129b6d561473df062fabdee22e2d7))

### [4.38.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.38.3-staging.0...@clerk/clerk-js@4.38.3) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-js

### [4.38.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.38.1...@clerk/clerk-js@4.38.2) (2023-04-19)

### Bug Fixes

- **clerk-js:** Add resetPassword method as a core resource ([fa70749](https://github.com/clerkinc/javascript/commit/fa70749c3bc0e37433b314ea9e12c5153bf60e0e))
- **clerk-js:** Do not append \_\_clerk_db_jwt if it already exists ([2c9082a](https://github.com/clerkinc/javascript/commit/2c9082a15f24d360d67620908a36e5f011985392))
- **clerk-js:** Refactor types for resetPassword ([fd53901](https://github.com/clerkinc/javascript/commit/fd53901c0fd4ce7c7c81a9239d4818002b83f58c))

### [4.38.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.38.1-staging.1...@clerk/clerk-js@4.38.1) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-js

## [4.38.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.38.0-staging.5...@clerk/clerk-js@4.38.0) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-js

## [4.37.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.37.0-staging.1...@clerk/clerk-js@4.37.0) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-js

## [4.36.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.36.0-staging.1...@clerk/clerk-js@4.36.0) (2023-04-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.35.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.35.0-staging.3...@clerk/clerk-js@4.35.0) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-js

## [4.35.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.35.0-staging.2...@clerk/clerk-js@4.35.0-staging.3) (2023-03-31)

### Bug Fixes

- **clerk-js:** Run multidomain getters only in browser ([ad10705](https://github.com/clerkinc/javascript/commit/ad1070506d1b529e6b19483234e5137c539b353c))

### [4.34.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.34.1-staging.0...@clerk/clerk-js@4.34.1) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.34.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.34.0-staging.1...@clerk/clerk-js@4.34.0) (2023-03-29)

### Bug Fixes

- **clerk-js:** Bring back error for missing proxyUrlAndDomain ([f1ebfd8](https://github.com/clerkinc/javascript/commit/f1ebfd8526906c32d4a40f00985a6b2303fd39a4))

## [4.32.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.32.0-staging.2...@clerk/clerk-js@4.32.0) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-js

## [4.31.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.31.0-staging.3...@clerk/clerk-js@4.31.0) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-js

### [4.30.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.30.0...@clerk/clerk-js@4.30.1) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.30.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.30.0-staging.0...@clerk/clerk-js@4.30.0) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.29.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.29.1-staging.1...@clerk/clerk-js@4.29.1) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.29.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.29.0-staging.0...@clerk/clerk-js@4.29.0) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-js

### [4.28.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.28.1-staging.1...@clerk/clerk-js@4.28.1) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-js

### [4.28.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.28.1-staging.0...@clerk/clerk-js@4.28.1-staging.1) (2023-02-25)

### Bug Fixes

- **clerk-js:** Dispatch token update only for session token ([fc6837b](https://github.com/clerkinc/javascript/commit/fc6837b3e9b5fae018b51f4814f3b1f8281f00cc))

## [4.28.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.28.0-staging.0...@clerk/clerk-js@4.28.0) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.27.3-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.27.3-staging.2...@clerk/clerk-js@4.27.3-staging.3) (2023-02-22)

### Bug Fixes

- **clerk-js:** Pass unsafe metadata to sign up methods ([e2510e6](https://github.com/clerkinc/javascript/commit/e2510e65b726c113de977fb8252cdcd708ad9bb7))

### [4.27.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.27.2-staging.0...@clerk/clerk-js@4.27.2) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-js

### [4.27.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.27.1-staging.2...@clerk/clerk-js@4.27.1) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-js

## [4.27.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.27.0-staging.1...@clerk/clerk-js@4.27.0) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-js

### [4.26.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.26.1-staging.0...@clerk/clerk-js@4.26.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.26.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.26.0-staging.1...@clerk/clerk-js@4.26.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.26.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.26.0-staging.1...@clerk/clerk-js@4.26.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.25.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.25.0-staging.5...@clerk/clerk-js@4.25.0) (2023-02-01)

### Bug Fixes

- **clerk-js:** Do not discard relative redirect urls ([#754](https://github.com/clerkinc/javascript/issues/754)) ([6b227ff](https://github.com/clerkinc/javascript/commit/6b227ffac5ded2ef30f5f586891c2985c7569805))

## [4.24.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.24.0-staging.2...@clerk/clerk-js@4.24.0) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.23.3-staging.2...@clerk/clerk-js@4.23.3) (2023-01-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.23.1...@clerk/clerk-js@4.23.2) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-js

### [4.23.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.23.0...@clerk/clerk-js@4.23.1) (2023-01-17)

### Bug Fixes

- **clerk-js:** Add missing dev instance suffix for new accounts.dev urls ([cb2e516](https://github.com/clerkinc/javascript/commit/cb2e516fb8c45c7438a867083a641b9ee4cab2f9))

## [4.23.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.23.0-staging.3...@clerk/clerk-js@4.23.0) (2023-01-17)

**Note:** Version bump only for package @clerk/clerk-js

### [4.22.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.22.1-staging.0...@clerk/clerk-js@4.22.1) (2022-12-23)

**Note:** Version bump only for package @clerk/clerk-js

## [4.22.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.22.0-staging.0...@clerk/clerk-js@4.22.0) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.6...@clerk/clerk-js@4.21.7) (2022-12-14)

### Bug Fixes

- **clerk-js:** Fix spacing between membership widget and members table ([255d495](https://github.com/clerkinc/javascript/commit/255d49568c687a4b8cc44f4c88bfc44f3bf5d049))

### [4.21.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.6-staging.0...@clerk/clerk-js@4.21.6) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.4...@clerk/clerk-js@4.21.5) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.4-staging.0...@clerk/clerk-js@4.21.4) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.3-staging.2...@clerk/clerk-js@4.21.3) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-js

### [4.21.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.1...@clerk/clerk-js@4.21.2) (2022-12-08)

### Reverts

- Revert "feat(clerk-js,types): Terse paths parameters (#572)" ([93bdff8](https://github.com/clerkinc/javascript/commit/93bdff8362a7e0cbe4bfe44c22b9039d4fb47fb8)), closes [#572](https://github.com/clerkinc/javascript/issues/572)

### [4.21.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.0...@clerk/clerk-js@4.21.1) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-js

## [4.21.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.21.0-staging.0...@clerk/clerk-js@4.21.0) (2022-12-08)

### Bug Fixes

- **clerk-js:** Tweak options spacing in organization switcher ([b43dac2](https://github.com/clerkinc/javascript/commit/b43dac25265e4ba6b59969b3c98609a64ff5a9a8))
- **clerk-js:** Tweak options spacing in organization switcher ([c1f1a7c](https://github.com/clerkinc/javascript/commit/c1f1a7c994951bb6a2162e08772c59d4a640debc))

## [4.20.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.20.0-staging.1...@clerk/clerk-js@4.20.0) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.19.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.19.0-staging.2...@clerk/clerk-js@4.19.0) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-js

## [4.19.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.19.0-staging.1...@clerk/clerk-js@4.19.0-staging.2) (2022-11-30)

### Bug Fixes

- **clerk-js:** Update typo ([4278a9e](https://github.com/clerkinc/javascript/commit/4278a9e5ceb92de5a53d6ee938b59e08bd1ecb39))

## [4.19.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.19.0-staging.0...@clerk/clerk-js@4.19.0-staging.1) (2022-11-30)

### Bug Fixes

- **clerk-js:** Treat **unstable**billing props as functions or strings ([3c8bf9c](https://github.com/clerkinc/javascript/commit/3c8bf9c0a5a9c5e2c2fc73276e90c229e13dc348))

## [4.18.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.18.0-staging.8...@clerk/clerk-js@4.18.0) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-js

## [4.18.0-staging.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.18.0-staging.7...@clerk/clerk-js@4.18.0-staging.8) (2022-11-30)

### Bug Fixes

- **clerk-js:** Rename billing widget ([61a1a6a](https://github.com/clerkinc/javascript/commit/61a1a6acfa90db24e1288f793217ec2315e7f8fb))
- **clerk-js:** Rename memberships widget ([20cf1e4](https://github.com/clerkinc/javascript/commit/20cf1e4fe42d11b0f2f10551c4060f4282e7eb5b))

## [4.18.0-staging.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.18.0-staging.6...@clerk/clerk-js@4.18.0-staging.7) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.18.0-staging.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.18.0-staging.5...@clerk/clerk-js@4.18.0-staging.6) (2022-11-29)

### Bug Fixes

- **clerk-js:** Fix cookieless logic ([698740e](https://github.com/clerkinc/javascript/commit/698740e41108ba24ba39a64997fdafdce58d0f8e))

## [4.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.17.0-staging.1...@clerk/clerk-js@4.17.0) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-js

## [4.17.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.17.0-staging.0...@clerk/clerk-js@4.17.0-staging.1) (2022-11-25)

### Bug Fixes

- **clerk-js:** Ensure #/ prefix for hashes ([0243403](https://github.com/clerkinc/javascript/commit/0243403f9ff71bf1da164b1a4f5019d63445fdde))

### [4.16.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.16.2-staging.0...@clerk/clerk-js@4.16.2) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-js

### [4.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.16.0...@clerk/clerk-js@4.16.1) (2022-11-23)

### Bug Fixes

- **clerk-js:** Add headless folder to final package ([b22d6f9](https://github.com/clerkinc/javascript/commit/b22d6f93d35254a679086d790509757b4b589f11))

## [4.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.16.0-staging.5...@clerk/clerk-js@4.16.0) (2022-11-22)

### Bug Fixes

- **clerk-js:** Adjust picker text size in PhoneInput ([5f6ec69](https://github.com/clerkinc/javascript/commit/5f6ec691ee8225a187214e748ceb2997fa75d26a))

## [4.16.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.16.0-staging.2...@clerk/clerk-js@4.16.0-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/clerk-js

## [4.16.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.16.0-staging.1...@clerk/clerk-js@4.16.0-staging.2) (2022-11-21)

### Features

- **clerk-js:** Export all ClerkJS error utilities ([c225288](https://github.com/clerkinc/javascript/commit/c2252881516da07d7ccac288ebfb3ba9e86cee5c))
- **clerk-js:** Improve DX for headless import ([8d64310](https://github.com/clerkinc/javascript/commit/8d64310ab23c6e21f8a687e503521245acad8211))

### [4.15.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.15.2-staging.1...@clerk/clerk-js@4.15.2) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-js

### [4.15.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.15.0...@clerk/clerk-js@4.15.1) (2022-11-15)

### Bug Fixes

- **clerk-js:** Correct role change check in ActiveMembersList ([3cf8b5e](https://github.com/clerkinc/javascript/commit/3cf8b5e14669ef78d99a4d4975b7be709a6f3c8f))

## [4.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.15.0-staging.1...@clerk/clerk-js@4.15.0) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-js

### [4.14.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.14.1-staging.2...@clerk/clerk-js@4.14.1) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-js

## [4.14.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.14.0-staging.1...@clerk/clerk-js@4.14.0) (2022-11-05)

### Features

- **clerk-js,shared:** Introduce private unstable\_\_mutate to force mutate swr state ([2a21dd8](https://github.com/clerkinc/javascript/commit/2a21dd8ea3935f3889044c063fe7af4bfc03cbfd))
- **clerk-js:** Introduce withOrganizationsEnabledGuard ([00fc621](https://github.com/clerkinc/javascript/commit/00fc6212c4f9153a1a823198dfb70b7e3134befa))
- **clerk-js:** Reset card error when navigating in OrganizationMembers ([6a1e873](https://github.com/clerkinc/javascript/commit/6a1e8730c7678ab89b9ea244fe022f7002e050d9))
- **clerk-js:** Update avatar background color ([7874110](https://github.com/clerkinc/javascript/commit/7874110622cee6a83ce5d1d20544136c0d73447e))
- **types,clerk-js:** Introduce OrganizationSettings resource ([455911f](https://github.com/clerkinc/javascript/commit/455911f4166e4bea00aa62b32a05bef297983c61))

## [4.13.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.13.0-staging.8...@clerk/clerk-js@4.13.0) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.13.0-staging.3...@clerk/clerk-js@4.13.0-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.13.0-staging.1...@clerk/clerk-js@4.13.0-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.13.0-staging.1...@clerk/clerk-js@4.13.0-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-js

## [4.13.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.12.1...@clerk/clerk-js@4.13.0-staging.1) (2022-11-02)

### Features

- **clerk-js,types:** Organization invitation metadata ([87764b8](https://github.com/clerkinc/javascript/commit/87764b839cc65455347e1c19b15f4a17603201b8))
- **clerk-js:** Add `loaded` to core Clerk instance ([7c08a91](https://github.com/clerkinc/javascript/commit/7c08a914d674f05608503898542b907886465b7e))
- **clerk-js:** Set up the InviteMembersPage for OrganizationProfile ([882727f](https://github.com/clerkinc/javascript/commit/882727f72accecb4c084656d9233b9c265278a45))

### Bug Fixes

- **clerk-js:** Add TabPanel tabIndex and remove outline ([262499e](https://github.com/clerkinc/javascript/commit/262499eb17afe3838f1d4fd7a68e688ebe9aea36))
- **clerk-js:** Correctly truncate the name in the OrganizationProfile Navbar ([fc06ec7](https://github.com/clerkinc/javascript/commit/fc06ec79339d9a9ad8d8d5a650c7c24097808c30))
- **clerk-js:** Fallback to Default Gravatar when not provided an imageUrl ([580a423](https://github.com/clerkinc/javascript/commit/580a4232817e7a35cfb8f197dfbfda9a16776cce))
- **clerk-js:** Fix globalObject for UMD packaging ([7499207](https://github.com/clerkinc/javascript/commit/749920780ca1f82c6f1548e7aaa4244c7516bc6f))
- **clerk-js:** Prioritize focus of tabs when keyboard navigating ([3f90c38](https://github.com/clerkinc/javascript/commit/3f90c38b079d81662a763b276fb5dda326106cc7))
- **clerk-js:** Take into account enabled attributes and not first factors for Sign Up form ([d3fdb1d](https://github.com/clerkinc/javascript/commit/d3fdb1d9804025084a15006c925a3a3a1f2d36df))
- **clerk-js:** Update the OrgSwitcher trigger when hidePersonal is true ([8a0d8cd](https://github.com/clerkinc/javascript/commit/8a0d8cdc94d26d5f415ca5db60867b15a7c3ec2f))
- **clerk-js:** Wrap ImpersonationFab with `withCoreSessionSwitchGuard` ([1d7cea9](https://github.com/clerkinc/javascript/commit/1d7cea9f4bc7325f61b789601b62441240681c60))
- **clerk-js:** Wrap ImpersonationFab with withCoreUserGuard ([7405f34](https://github.com/clerkinc/javascript/commit/7405f34fd722b2f111e7d3842a05460697e6dddb))
- **clerk-react:** Add frontendAPI on window as a fallback ([06f8b37](https://github.com/clerkinc/javascript/commit/06f8b3755cda83455e301591badaf16e1d59dd33))

### [4.12.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.12.0...@clerk/clerk-js@4.12.1) (2022-10-24)

### Bug Fixes

- **clerk-js:** Add missing localizationKey import ([fb17eca](https://github.com/clerkinc/javascript/commit/fb17ecac5a054027078ce1a7d8700cb497c526fa))

## [4.12.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.12.0-staging.1...@clerk/clerk-js@4.12.0) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-js

## [4.11.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.10.1...@clerk/clerk-js@4.11.0) (2022-10-14)

### Features

- **types,clerk-js:** List only authenticatable OAuth providers in Sign in/up components ([4b3f1e6](https://github.com/clerkinc/javascript/commit/4b3f1e67d655dfb3e818ce9015b68b369d7a1bd4))

### Bug Fixes

- **clerk-js:** Replace `avatar` descriptor with `avatarBox` ([65cab1f](https://github.com/clerkinc/javascript/commit/65cab1f4581ea40244c139a59e27f2dac7407d97))

### [4.10.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.10.0...@clerk/clerk-js@4.10.1) (2022-10-14)

### Bug Fixes

- **shared:** Version bump for shared ([c0cebb5](https://github.com/clerkinc/javascript/commit/c0cebb50bc94fa44e37b96c5a645a8b18ba37df8))

## [4.10.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.10.0-staging.2...@clerk/clerk-js@4.10.0) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-js

## [4.10.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.9.0...@clerk/clerk-js@4.10.0-staging.1) (2022-10-13)

### Features

- **clerk-js,clerk-react,types:** Wire up `OrganizationSwitcher` and `OrganizationProfile` ([1e34e69](https://github.com/clerkinc/javascript/commit/1e34e6986ee49aeb9ca9f72cdc5d799d6611b53f))
- **clerk-js:** Add table and pagination elements ([cb56f5c](https://github.com/clerkinc/javascript/commit/cb56f5c0313ba6f1fce50eae6fc3e3d596cf1b16))
- **clerk-js:** Fade in text for ImpersonationFab ([25c24b2](https://github.com/clerkinc/javascript/commit/25c24b29564ea14e933ca6bfeb108b5fbeee0405))
- **clerk-js:** Introduce Menu element ([f4b4586](https://github.com/clerkinc/javascript/commit/f4b4586816734a97a06bc7a9ee1c12f728973daa))
- **clerk-js:** Introduce Select element and use it in PhoneInput ([9619bfe](https://github.com/clerkinc/javascript/commit/9619bfe6da4fb876f2ba6279f2c08d6a8c2d263c))
- **clerk-js:** Make the whole ImpersonationFab draggable ([85d65f8](https://github.com/clerkinc/javascript/commit/85d65f8ae962cb16b14ddf9b77b4bf42cb1423da))
- **clerk-js:** Replace Switch Account text with icon ([1262f1b](https://github.com/clerkinc/javascript/commit/1262f1bfacd10df0a292fe0250b8843729aa1162))

### Bug Fixes

- **clerk-js:** Add appearance customization support for avatar gradient ([96cde45](https://github.com/clerkinc/javascript/commit/96cde45b4f1db5ff074289b57ff58c40bf80f6e1))
- **clerk-js:** Add default colors for avatar ([703fbd9](https://github.com/clerkinc/javascript/commit/703fbd9922c25b4e34fc8b443020e77d54a11afe))
- **clerk-js:** Add global not_allowed_access error to localization prop ([0313fe5](https://github.com/clerkinc/javascript/commit/0313fe5ce4e0afca20865ad1b6d0503502ea6e4d))
- **clerk-js:** Consistent ImpersonationFab drag behaviour in mobile ([b53d0a8](https://github.com/clerkinc/javascript/commit/b53d0a88b898e9aa8161906b671e0cd70c5ba2e9))
- **clerk-js:** Extract BoringAvatar library module ([ca5420b](https://github.com/clerkinc/javascript/commit/ca5420b4dd6a6ddb26086c1f1641e9b2b44ea7b2))
- **clerk-js:** Fix useSupportEmail.test.tsx ([52bb1cb](https://github.com/clerkinc/javascript/commit/52bb1cb950edc88b53c8ea05c88b3cfd6b1d377e))
- **clerk-js:** Implement tabs components ([d9428cd](https://github.com/clerkinc/javascript/commit/d9428cdf21889318a181310f32ea77fe1f627e7e))
- **clerk-js:** Improve keyboard nav and handle disabled tabs order of focus ([ae87f00](https://github.com/clerkinc/javascript/commit/ae87f0025b457ac64a60bd5176406bb46b1d532f))
- **clerk-js:** Introduce FullHeightLoader element and replace Spinner in UserProfile ([121d697](https://github.com/clerkinc/javascript/commit/121d6972889fe8ecc3d534e12e40273766b2ba41))
- **clerk-js:** Make global errors localizable ([e674272](https://github.com/clerkinc/javascript/commit/e674272bfe61d8eae24db3c10436f92eaf98a5da))
- **clerk-js:** Make translateError fallback to longMessage first ([78627ca](https://github.com/clerkinc/javascript/commit/78627ca84f96627c3b5ccd77e4fbbcb52f5df784))
- **clerk-js:** Minor refactor in naming and types ([8e1d32b](https://github.com/clerkinc/javascript/commit/8e1d32b660e33c2131642de0e9d0435e40544362))
- **clerk-js:** Remove redundant code ([49c97e2](https://github.com/clerkinc/javascript/commit/49c97e2165eb54a430c22a74e86649e298205644))
- **clerk-js:** Replace gravatar with Boring avatar ([7f2e2b6](https://github.com/clerkinc/javascript/commit/7f2e2b600fb746cc36c8464629d63ca3aa1a430b))

## [4.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.9.0-staging.1...@clerk/clerk-js@4.9.0) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.8.1-staging.0...@clerk/clerk-js@4.8.1) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-js

## [4.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.8.0-staging.3...@clerk/clerk-js@4.8.0) (2022-10-03)

### Features

- **clerk-js:** Add open prop in user button ([6ae7f42](https://github.com/clerkinc/javascript/commit/6ae7f4226f4db5760e04ee812a494beb66ab2502))

### Bug Fixes

- **clerk-js:** Refactor defaultOpen prop ([1d7b0a9](https://github.com/clerkinc/javascript/commit/1d7b0a997a86686644d28ac58d0bd7143af9023f))
- **clerk-js:** Refactor isOpen prop ([044860f](https://github.com/clerkinc/javascript/commit/044860f7204988876b258141108d0e1741204bc1))

## [4.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.7.0-staging.4...@clerk/clerk-js@4.7.0) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-js

### [4.6.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.6.0...@clerk/clerk-js@4.6.1) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-js

## [4.6.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.6.0-staging.1...@clerk/clerk-js@4.6.0) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-js

## [4.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.5.0-staging.2...@clerk/clerk-js@4.5.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-js

### [4.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.4.0-staging.4...@clerk/clerk-js@4.4.1) (2022-09-19)

### Bug Fixes

- **clerk-js:** Add missing applicationName param to `signUp.continue.subtitle` ([1a41709](https://github.com/clerkinc/javascript/commit/1a41709965d58925ea43f26593c9cbf13405b694))
- **clerk-js:** Add missing applicationName param to `signUp.emailLink.subtitle` ([bd5c8f2](https://github.com/clerkinc/javascript/commit/bd5c8f2b9b7eb6eae7d3a2a47be40c86b046ef38))
- **clerk-js:** Stop infinite TOTP re-renders by removing user from the dep array ([dc935bb](https://github.com/clerkinc/javascript/commit/dc935bba64561a485a7670f0f4994150c7938b07))
- **clerk-js:** Typo on remove phone number page ([5fa86a4](https://github.com/clerkinc/javascript/commit/5fa86a43edb391b8649c431b8dac8d5ca4f6edca))

## [4.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.4.0-staging.4...@clerk/clerk-js@4.4.0) (2022-09-16)

### Bug Fixes

- **clerk-js:** Add missing applicationName param to `signUp.continue.subtitle` ([1a41709](https://github.com/clerkinc/javascript/commit/1a41709965d58925ea43f26593c9cbf13405b694))
- **clerk-js:** Stop infinite TOTP re-renders by removing user from the dep array ([dc935bb](https://github.com/clerkinc/javascript/commit/dc935bba64561a485a7670f0f4994150c7938b07))

### [4.3.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.5-staging.0...@clerk/clerk-js@4.3.5) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.4-staging.1...@clerk/clerk-js@4.3.4) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.3-staging.0...@clerk/clerk-js@4.3.3) (2022-09-03)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.2-staging.2...@clerk/clerk-js@4.3.2) (2022-09-02)

**Note:** Version bump only for package @clerk/clerk-js

### [4.3.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.1-staging.0...@clerk/clerk-js@4.3.1) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-js

## [4.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.3.0-staging.0...@clerk/clerk-js@4.3.0) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-js

### [4.2.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.2.2-staging.1...@clerk/clerk-js@4.2.2) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-js

### [4.2.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.2.0...@clerk/clerk-js@4.2.1) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.2.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.2.0-staging.1...@clerk/clerk-js@4.2.0) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-js

## [4.2.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.2.0-staging.0...@clerk/clerk-js@4.2.0-staging.1) (2022-08-18)

### Bug Fixes

- **clerk-js:** Minor cleanup ([d44a8a9](https://github.com/clerkinc/javascript/commit/d44a8a910a419bb72a873c34e2e4d0421d8eacfc))

### [4.1.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.1.0...@clerk/clerk-js@4.1.1) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-js

## [4.1.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.1.0-staging.1...@clerk/clerk-js@4.1.0) (2022-08-11)

**Note:** Version bump only for package @clerk/clerk-js

### [4.0.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.0.2-staging.0...@clerk/clerk-js@4.0.2) (2022-08-09)

### Bug Fixes

- **clerk-js:** Improve invalid color error ([715d21c](https://github.com/clerkinc/javascript/commit/715d21ca1bd3461f3a8221582e1dc2ca656bb89b))
- **clerk-js:** Introduce more selectors ([bf4c3b3](https://github.com/clerkinc/javascript/commit/bf4c3b372c7e74b1b42ce53cb7254e54b67c7815))

### [4.0.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.0.0...@clerk/clerk-js@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-js

## [4.0.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@4.0.0-staging.1...@clerk/clerk-js@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-js

## [3.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.16.4...@clerk/clerk-js@3.17.0) (2022-08-04)

### Features

- **clerk-js:** Get support email from FAPI /v1/environment if exists ([c9bb8d7](https://github.com/clerkinc/javascript/commit/c9bb8d7aaf3958207d4799bdd30e3b15b2890a5d))

### [3.16.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.16.3...@clerk/clerk-js@3.16.4) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.16.3-staging.1...@clerk/clerk-js@3.16.3) (2022-07-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.16.1...@clerk/clerk-js@3.16.2) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-js

### [3.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.16.0...@clerk/clerk-js@3.16.1) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.15.0...@clerk/clerk-js@3.16.0) (2022-07-01)

### Features

- **types,clerk-js:** Introduce user hasVerifiedEmailAddress & hasVerifiedPhoneNumber attributes ([ea68447](https://github.com/clerkinc/javascript/commit/ea684473697c33b7b5d8930fe24b7667f6edeaad))

## [3.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.14.0...@clerk/clerk-js@3.15.0) (2022-06-24)

### Features

- **clerk-js:** Add supportEmail property option ([71eff74](https://github.com/clerkinc/javascript/commit/71eff74383bcd1c3044cfd42ceae70de5b246e68))

## [3.14.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.14.0-staging.1...@clerk/clerk-js@3.14.0) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-js

## [3.14.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.14.0-staging.0...@clerk/clerk-js@3.14.0-staging.1) (2022-06-16)

### Bug Fixes

- **clerk-js:** Default verification status to unverified if verification is missing ([cac67a0](https://github.com/clerkinc/javascript/commit/cac67a0199c0058ba23a7b74834dfa55915a42ae))

### [3.13.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.13.3-staging.0...@clerk/clerk-js@3.13.3) (2022-06-15)

**Note:** Version bump only for package @clerk/clerk-js

### [3.13.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.13.2-staging.0...@clerk/clerk-js@3.13.2) (2022-06-07)

**Note:** Version bump only for package @clerk/clerk-js

### [3.13.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.13.0...@clerk/clerk-js@3.13.1) (2022-06-06)

### Bug Fixes

- **clerk-js:** Fix new URL constructor ([d0cc743](https://github.com/clerkinc/javascript/commit/d0cc74330bfbf277fa5529e9e537cad384875653))

## [3.13.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.11...@clerk/clerk-js@3.13.0) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.12.0-staging.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.10...@clerk/clerk-js@3.12.0-staging.11) (2022-06-03)

### Bug Fixes

- **clerk-js:** Teach ClerkJS to work in expo again ([5492b69](https://github.com/clerkinc/javascript/commit/5492b691f4e865223487e86585d8539bbf99dcf3))

## [3.12.0-staging.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.9...@clerk/clerk-js@3.12.0-staging.10) (2022-06-03)

### Bug Fixes

- **clerk-js:** Apply minor copywriting fixes ([4a1dab4](https://github.com/clerkinc/javascript/commit/4a1dab454908cc90276a67e0f3d43bb625679ee8))
- **clerk-js:** Apply minor copywriting fixes - pt2 ([49c128b](https://github.com/clerkinc/javascript/commit/49c128b80d0282d0e687470990b36080544dc176))

## [3.12.0-staging.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.8...@clerk/clerk-js@3.12.0-staging.9) (2022-06-03)

### Bug Fixes

- **clerk-js:** If organization is `null`, set the active org as null ([f7bff5c](https://github.com/clerkinc/javascript/commit/f7bff5c586a33e2b45258912924ab27b4ecf6da9))
- **clerk-js:** Render SignUp form input errors if missing ([bec968c](https://github.com/clerkinc/javascript/commit/bec968c79a34b77ca62d74985e4647d556248644))

## [3.12.0-staging.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.7...@clerk/clerk-js@3.12.0-staging.8) (2022-06-03)

### Bug Fixes

- **clerk-js,types:** Typo for MetaMask web3 provider name ([922dcb5](https://github.com/clerkinc/javascript/commit/922dcb52f406a17da8038cafaf10353b15aab2bf))
- **clerk-js:** Improve removal page copyright for connected account and web3 wallet ([bfdfbba](https://github.com/clerkinc/javascript/commit/bfdfbba20fdfcdb86f451902ed12133ee54bd3fe))
- **clerk-js:** Render UserProfile connected account section only if at least one provider is enabled ([23a127f](https://github.com/clerkinc/javascript/commit/23a127f60b08b7551df05d5ec88980f404e527d0))

## [3.12.0-staging.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.6...@clerk/clerk-js@3.12.0-staging.7) (2022-06-02)

### Features

- **clerk-js:** Support multiple unverified identifiers during Sign up flow ([3ec9dd5](https://github.com/clerkinc/javascript/commit/3ec9dd58379b9e56eccde9ecad1081a69bb7bf6b))
- **types,clerk-js:** Support required/optional email/phone for Progressive sign up instances ([13da457](https://github.com/clerkinc/javascript/commit/13da4576a08e4e396fa48605ecf61accc06057d5))

## [3.12.0-staging.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.5...@clerk/clerk-js@3.12.0-staging.6) (2022-06-01)

### Features

- **types,clerk-js:** Introduce web3 wallet operations in UserProfile ([6570a87](https://github.com/clerkinc/javascript/commit/6570a87439d92a59057b2df50ec482511428495e))

### Bug Fixes

- **clerk-js:** Do not show verification status badges for ext accnts on the user profile page ([0fa4f46](https://github.com/clerkinc/javascript/commit/0fa4f462931ca91560d8dc0d16259b910555c741))
- **clerk-js:** Emit changes in organization to listeners ([798ee62](https://github.com/clerkinc/javascript/commit/798ee622e7961d3aa7f8842184f5fadbcfed517f))
- **clerk-js:** Fixed bugs in `setActive` caused by new conditions on session ([37f4010](https://github.com/clerkinc/javascript/commit/37f4010362e8af4ea8aa62f8bf925df4527906ef))
- **types,clerk-js:** Same component navigate after OAuth flow with missing requirements ([39ca6ce](https://github.com/clerkinc/javascript/commit/39ca6cee3a8a160fdf0ca95a713707afee55f1fc))

## [3.12.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.4...@clerk/clerk-js@3.12.0) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-js

## [3.12.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.3...@clerk/clerk-js@3.12.0-staging.4) (2022-05-20)

### Bug Fixes

- **clerk-js:** Refactor imports to stop bundling shared when not used ([b0d5e73](https://github.com/clerkinc/javascript/commit/b0d5e73ff718c43382cbf6f2ad23ae9627a8eb9a))

## [3.12.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.12.0-staging.2...@clerk/clerk-js@3.12.0-staging.3) (2022-05-19)

### Bug Fixes

- **clerk-js:** Fix password field display logic, fix margin between oauth & web3 providers ([fe601a4](https://github.com/clerkinc/javascript/commit/fe601a495f4bead1dc7dd8b37bdb8aa45566d143))

## [3.12.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.2) (2022-05-18)

### Features

- **clerk-js:** Make sign up flow resumable ([bfe0d8c](https://github.com/clerkinc/javascript/commit/bfe0d8cb917d9be3441b7f8a9473e905310fe6e4))
- **clerk-js:** Make sign up flow resumable for Web3 providers ([cf49066](https://github.com/clerkinc/javascript/commit/cf4906692cb1ae4eb41ac44a6d2dae64aba97fea))
- **clerk-js:** Replace Error & Info component with a single Alert component ([8c34d21](https://github.com/clerkinc/javascript/commit/8c34d2176fcc9eca346b6be91ff5dd1987929c28))
- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerkinc/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))
- **types,clerk-js:** Enhance Web3 wallet resource with relevant operations ([a166716](https://github.com/clerkinc/javascript/commit/a166716db44db8e765e67c154093c9d3c3f24c75))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerkinc/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [3.12.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.1) (2022-05-17)

### Features

- **clerk-js:** Make sign up flow resumable ([bfe0d8c](https://github.com/clerkinc/javascript/commit/bfe0d8cb917d9be3441b7f8a9473e905310fe6e4))
- **clerk-js:** Make sign up flow resumable for Web3 providers ([cf49066](https://github.com/clerkinc/javascript/commit/cf4906692cb1ae4eb41ac44a6d2dae64aba97fea))
- **clerk-js:** Replace Error & Info component with a single Alert component ([8c34d21](https://github.com/clerkinc/javascript/commit/8c34d2176fcc9eca346b6be91ff5dd1987929c28))
- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerkinc/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))

### Bug Fixes

- **clerk-js:** Navigate to sign up continue in web3 ([460ba1c](https://github.com/clerkinc/javascript/commit/460ba1cc82bbad6197224ca71ad39302564408b4))

## [3.12.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.11.0...@clerk/clerk-js@3.12.0-staging.0) (2022-05-16)

### Features

- **clerk-js:** Session touch should include the active organization ([664030c](https://github.com/clerkinc/javascript/commit/664030c3f4aedbd5e886d8ada906b64ac2ed06b5))

## [3.11.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.11.0) (2022-05-13)

### Features

- **clerk-js:** Add shortcut to active org in Clerk singleton ([03e68d4](https://github.com/clerkinc/javascript/commit/03e68d4667e7abcd006c4a3a2a2fe7f65bfca417))

### [3.10.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.10.4) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.2...@clerk/clerk-js@3.10.3) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.2-staging.1...@clerk/clerk-js@3.10.2) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-js

### [3.10.2-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.2-staging.0...@clerk/clerk-js@3.10.2-staging.1) (2022-05-11)

### Bug Fixes

- **clerk-js:** Use redirect_url across all auth flows ([#229](https://github.com/clerkinc/javascript/issues/229)) ([5dfdc2d](https://github.com/clerkinc/javascript/commit/5dfdc2dd395728ec8b6afaddb13d2ca9bb6d48fb))

### [3.10.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.0...@clerk/clerk-js@3.10.1) (2022-05-06)

**Note:** Version bump only for package @clerk/clerk-js

## [3.10.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.10.0-staging.0...@clerk/clerk-js@3.10.0) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-js

## [3.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.8.1-staging.0...@clerk/clerk-js@3.9.0) (2022-04-28)

### Features

- **clerk-js:** Add members to organizations ([d6787b6](https://github.com/clerkinc/javascript/commit/d6787b659744ea2ca178d6cf7df488be265d7a69))
- **clerk-js:** Delete organizations ([7cb1bea](https://github.com/clerkinc/javascript/commit/7cb1beaf12b293b9fde541855eb2cda81e0d6be4))

## [3.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.8.0-staging.0...@clerk/clerk-js@3.8.0) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-js

### [3.7.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.7.1-staging.1...@clerk/clerk-js@3.7.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-js

### [3.7.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.7.1-staging.0...@clerk/clerk-js@3.7.1-staging.1) (2022-04-19)

### Bug Fixes

- **clerk-js:** Pass rotating_token_nonce correctly to FAPIClient ([370cb0e](https://github.com/clerkinc/javascript/commit/370cb0e26bccd524c44b9e7fc0e15521193f514f))

## [3.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.6.1-alpha.0...@clerk/clerk-js@3.7.0) (2022-04-18)

### Features

- **clerk-js:** Organization slugs ([7f0e771](https://github.com/clerkinc/javascript/commit/7f0e771036815885b01da095979cf39da212503f))

### [3.6.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.6.0...@clerk/clerk-js@3.6.1-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-js

## [3.6.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.6.0-staging.0...@clerk/clerk-js@3.6.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-js

## [3.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.5.0-staging.0...@clerk/clerk-js@3.5.0) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-js

### [3.4.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.4.1...@clerk/clerk-js@3.4.2) (2022-04-11)

### Bug Fixes

- **clerk-js:** Set provider as busy when initiating oauth connection & prevent further clicks ([a2faf0f](https://github.com/clerkinc/javascript/commit/a2faf0f032d23e1733460eb94ac8fed20f1dc9bb))

### [3.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.4.0...@clerk/clerk-js@3.4.1) (2022-04-07)

### Bug Fixes

- **clerk-js:** Hide unverified accts from profile, skip unverified accts w/o known error from list ([ac28d0d](https://github.com/clerkinc/javascript/commit/ac28d0dcac55ac39ac10dc3a7600c0abd5d65b3c))

## [3.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.4.0-staging.0...@clerk/clerk-js@3.4.0) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-js

## [3.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.2.2...@clerk/clerk-js@3.3.0) (2022-03-31)

### Features

- **clerk-react:** Allow usernames to be optional ([ea4583a](https://github.com/clerkinc/javascript/commit/ea4583a0a86cd1a73fb8408a0b599f31d06adcc8))

### [3.2.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.2.2-staging.0...@clerk/clerk-js@3.2.2) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-js

### [3.2.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.2.1-staging.0...@clerk/clerk-js@3.2.1) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-js

## [3.2.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.2.0-alpha.0...@clerk/clerk-js@3.2.0) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-js

## [3.2.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.1.2-staging.0...@clerk/clerk-js@3.2.0-staging.0) (2022-03-24)

### Features

- **types,clerk-js,backend-core,clerk-react:** Replace thrown error with null return in getToken ([d972f93](https://github.com/clerkinc/javascript/commit/d972f93684a39abf3619c335cc012b61d5187100))

### Bug Fixes

- **clerk-js:** Force client update on resource reload ([#143](https://github.com/clerkinc/javascript/issues/143)) ([1dd0af2](https://github.com/clerkinc/javascript/commit/1dd0af253466c49dca988f47a6bf30482d4ddcaa))

### [3.1.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.1.1-staging.0...@clerk/clerk-js@3.1.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-js

## [3.1.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.1.0-alpha.0...@clerk/clerk-js@3.1.0-alpha.1) (2022-03-23)

### Features

- **types,clerk-js:** Allow connecting external accounts from the user profile page ([180961b](https://github.com/clerkinc/javascript/commit/180961b61d5f6b75b5bc373f5d644cd0576831a8))

## [3.1.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.0.1-alpha.3...@clerk/clerk-js@3.1.0-alpha.0) (2022-03-23)

### Features

- **clerk-js,types:** Rename UserButton params to afterSignOutUrl, afterMultiSessionSingleSignOutUrl ([c4cb76a](https://github.com/clerkinc/javascript/commit/c4cb76a1133fd2308b217cacaffb086b175f6347))

### Bug Fixes

- **clerk-js:** Stop parsing deprecated params from query strings ([8280d96](https://github.com/clerkinc/javascript/commit/8280d96f3cc99290687a551627c675e2b6a1edf0))

### [3.0.1-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.0.1-alpha.2...@clerk/clerk-js@3.0.1-alpha.3) (2022-03-22)

### Bug Fixes

- **clerk-expo:** Setup createPageLifecycle only in browser environment ([#133](https://github.com/clerkinc/javascript/issues/133)) ([75bd5a1](https://github.com/clerkinc/javascript/commit/75bd5a1ee73d60fe5ed48fe96e2823054376ffd2))
- **clerk-js:** Add createdUserId attribute to SignUp ([#132](https://github.com/clerkinc/javascript/issues/132)) ([b1884bd](https://github.com/clerkinc/javascript/commit/b1884bd950d9fcb27505269a09038dd571072a4e))

### [3.0.1-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.2) (2022-03-22)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerkinc/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerkinc/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerkinc/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))
- **clerk-js:** Show password only if required ([cc687ea](https://github.com/clerkinc/javascript/commit/cc687eace1d55dec878d81240d2d629e61debb27))

### [3.0.1-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.1) (2022-03-20)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([d5f6b26](https://github.com/clerkinc/javascript/commit/d5f6b264cf58ce40c68de298b4c7c564d472001f))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerkinc/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerkinc/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

### [3.0.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@3.0.1-staging.0...@clerk/clerk-js@3.0.1-alpha.0) (2022-03-19)

### Bug Fixes

- **clerk-js,clerk-react:** Move error to getToken ([84d21ce](https://github.com/clerkinc/javascript/commit/84d21ceac26843a1caa9d9d58f9c10ea2da6395e))
- **clerk-js:** Fix signIn.prepareFirstFactor params ([e435245](https://github.com/clerkinc/javascript/commit/e4352454028099f0973203aa79e548890c6327bd))
- **clerk-js:** Make getToken use /user endpoint for integration tokens ([b61213b](https://github.com/clerkinc/javascript/commit/b61213b4c94952e6f21dd8e036aa6815c5c38c06))

## [3.0.0-alpha.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.3...@clerk/clerk-js@3.0.0-alpha.9) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-js

## [3.0.0-alpha.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@3.0.0-alpha.8) (2022-02-28)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerkinc/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

## [3.0.0-alpha.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@3.0.0-alpha.7) (2022-02-25)

**Note:** Version bump only for package @clerk/clerk-js

## [3.0.0-alpha.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.2...@clerk/clerk-js@3.0.0-alpha.6) (2022-02-18)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.6-staging.1...@clerk/clerk-js@2.17.6) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.6-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.6-staging.0...@clerk/clerk-js@2.17.6-staging.1) (2022-03-17)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.3...@clerk/clerk-js@2.17.4) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.3-staging.0...@clerk/clerk-js@2.17.3) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-js

### [2.17.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.0...@clerk/clerk-js@2.17.1) (2022-03-04)

### Bug Fixes

- **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerkinc/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))

## [2.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.16.1...@clerk/clerk-js@2.17.0) (2022-03-04)

### Features

- **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerkinc/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
- **clerk-js:** Add more attributes on organization models ([af010ba](https://github.com/clerkinc/javascript/commit/af010bac4b6e0519eff42d210049c7b3a6bda203))
- **clerk-js:** Add organization basic resources ([09f9012](https://github.com/clerkinc/javascript/commit/09f90126282f757cee6f97e7eae8747abc641bb0))
- **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerkinc/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
- **clerk-js:** Basic organization data shape tests ([0ca9a31](https://github.com/clerkinc/javascript/commit/0ca9a3114b34bfaa338e6e90f1b0d57e02b7dd58))
- **clerk-js:** Invitation flow draft ([d6faaab](https://github.com/clerkinc/javascript/commit/d6faaabb7efec09a699c7e83ba24fd4bad199d6b))
- **clerk-js:** Sign up next draft and fixes ([e2eef78](https://github.com/clerkinc/javascript/commit/e2eef782d644f7fd1925fee67ee81d27473255fc))
- **clerk-js:** SignUp with organization invitation flow draft ([2a9edbd](https://github.com/clerkinc/javascript/commit/2a9edbd52916f9bc037f266d1f96269cf54023cb))
- **clerk-react,clerk-js:** Add useOrganization hook using \_\_unstable attribute ([1635132](https://github.com/clerkinc/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))

### Bug Fixes

- **clerk-js:** Don't use ResizeObserver on old browsers ([581c5cd](https://github.com/clerkinc/javascript/commit/581c5cde9df542b7dcb6d69f61feaf480f7a0075))
- **types:** Guarantee elements not in oauth sorting array will be sorted last ([f3c2869](https://github.com/clerkinc/javascript/commit/f3c2869bc244fc594522ef8f889055f82d31463f))

### [2.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.16.0...@clerk/clerk-js@2.16.1) (2022-03-03)

### Bug Fixes

- **types:** Consolidate oauth provider types ([bce9ef5](https://github.com/clerkinc/javascript/commit/bce9ef5cbfe02e11fe71db3e34dbf4fd9be9c3ed))

## [2.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.15.0...@clerk/clerk-js@2.16.0) (2022-03-02)

### Features

- **types,clerk-js:** Introduce Notion OAuth ([#72](https://github.com/clerkinc/javascript/issues/72)) ([9e556d0](https://github.com/clerkinc/javascript/commit/9e556d00fb41dedbbd05de59947d00c720bb3d95))

### Bug Fixes

- **clerk-js:** Clear invalid invitation token value ([0c5dc85](https://github.com/clerkinc/javascript/commit/0c5dc85bd69b1050bf36e7108b38868e22022e61))

## [2.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@2.15.0) (2022-03-01)

### Features

- **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerkinc/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))

### [2.14.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3-staging.0...@clerk/clerk-js@2.14.3) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-js

### [2.14.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.2-staging.0...@clerk/clerk-js@2.14.3-staging.0) (2022-02-24)

### Features

- **clerk-js:** Introduce `UserSettings.instanceIsPasswordBased` ([f72a555](https://github.com/clerkinc/javascript/commit/f72a555f6adb38870539e9bab63cb638c04517d6))

### Bug Fixes

- **clerk-js,clerk-react:** Revert user settings work ([9a70576](https://github.com/clerkinc/javascript/commit/9a70576d1a47f01e6dbbfd8704f321daddcfe590))
- **clerk-js:** Helpful error message for sign in without factors ([9d8a050](https://github.com/clerkinc/javascript/commit/9d8a050d975fddb3e3163781d010138a888b7bf2))
- **clerk-js:** Import Clerk CSS after shared css modules/ components ([dde2f3b](https://github.com/clerkinc/javascript/commit/dde2f3b87a0e177967ce13f087806ebff2084ff5))
- **clerk-js:** Render instant password field for password-based instances only ([586437f](https://github.com/clerkinc/javascript/commit/586437f238723da6f03119e2069989eaabe48ddd))
- **clerk-js:** Render instant password field for password-based instances only ([a9eefc9](https://github.com/clerkinc/javascript/commit/a9eefc967d4745a54aee0c917ce707b1a51df1be))

### [2.14.2-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.1-staging.0...@clerk/clerk-js@2.14.2-staging.0) (2022-02-22)

### Features

- **clerk-js:** Allow passing of object style search params on fapiclient ([8144779](https://github.com/clerkinc/javascript/commit/8144779e37ca4b0a61ac1d452ddd0ab7ccf40f27))

### [2.14.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.0-staging.0...@clerk/clerk-js@2.14.1-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-js

## [2.14.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.3-staging.0...@clerk/clerk-js@2.14.0-staging.0) (2022-02-16)

### Features

- **clerk-js:** Import all resources from internal.ts ([#44](https://github.com/clerkinc/javascript/issues/44)) ([5b8f6f8](https://github.com/clerkinc/javascript/commit/5b8f6f81ed3d823840a0c4d3edcbd3c8298d7d42))

### [2.13.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.2...@clerk/clerk-js@2.13.3-staging.0) (2022-02-15)

### Features

- **clerk-js:** Introduce with `userSettings` in `SignIn` ([adccb35](https://github.com/clerkinc/javascript/commit/adccb35377b6455285dc11cbfabe0710c9035c3f))
- **clerk-js:** Introduce with `userSettings` in `UserProfile` ([62dff26](https://github.com/clerkinc/javascript/commit/62dff26d56c7a699d0db074e863a89ddf2ee86a7))
- **clerk-js:** Refactor signUp utils to work with userSettings ([0eb3352](https://github.com/clerkinc/javascript/commit/0eb3352cf93c35eb5de162822802124248cef840))
- **types:** Introduce 'UserSettingsResource' ([32fcf04](https://github.com/clerkinc/javascript/commit/32fcf0477e6db4851f4de50904c02868ba1790ee))

### [2.13.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.1...@clerk/clerk-js@2.13.2) (2022-02-14)

### Bug Fixes

- **clerk-js:** Remove unnecessary type assertions ([f580d4a](https://github.com/clerkinc/javascript/commit/f580d4aebfc3938ca152e7cbc529a8c948e0c311))

### [2.13.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.1-staging.0...@clerk/clerk-js@2.13.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-js

### 2.13.1-staging.0 (2022-02-11)

### Bug Fixes

- **clerk-js:** Prevent post auth redirects in Metamask flow ([#31](https://github.com/clerkinc/javascript/issues/31)) ([052ff1e](https://github.com/clerkinc/javascript/commit/052ff1e74ad76fd97010e6d899e0eb2acb1d717c))
