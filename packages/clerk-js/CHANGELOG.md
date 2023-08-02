# Change Log

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
