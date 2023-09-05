# Change Log

## 1.25.1

### Patch Changes

- Update "personal workspace" label to "personal account" ([#1648](https://github.com/clerkinc/javascript/pull/1648)) by [@panteliselef](https://github.com/panteliselef)

## 1.25.0

### Minor Changes

- Add uk-UA localization ([#1558](https://github.com/clerkinc/javascript/pull/1558)) by [@demptd13](https://github.com/demptd13)

### Patch Changes

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerkinc/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Introduces domains and invitations in <OrganizationProfile /> ([#1560](https://github.com/clerkinc/javascript/pull/1560)) by [@panteliselef](https://github.com/panteliselef)

  - The "Members" page now accommodates Domain and Individual invitations
  - The "Settings" page allows for the addition, edit and removal of a domain

- Add missing account deletion description to Korean translation file ([#1609](https://github.com/clerkinc/javascript/pull/1609)) by [@JungHoonGhae](https://github.com/JungHoonGhae)

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerkinc/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)

  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

- Introduces an invitation list within <OrganizationSwitcher/> ([#1554](https://github.com/clerkinc/javascript/pull/1554)) by [@panteliselef](https://github.com/panteliselef)

  - Users can accept the invitation that is sent to them

- When updating enrollment mode of a domain uses can now delete any pending invitations or suggestions. ([#1632](https://github.com/clerkinc/javascript/pull/1632)) by [@panteliselef](https://github.com/panteliselef)

- Add translations for deleteOrganization and domainSection objects to Korean ([#1630](https://github.com/clerkinc/javascript/pull/1630)) by [@JungHoonGhae](https://github.com/JungHoonGhae)

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerkinc/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

- Updated dependencies [[`96cc1921c`](https://github.com/clerkinc/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerkinc/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerkinc/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerkinc/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerkinc/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerkinc/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerkinc/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerkinc/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerkinc/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerkinc/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerkinc/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerkinc/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerkinc/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerkinc/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerkinc/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerkinc/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerkinc/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerkinc/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0

## 1.24.1

### Patch Changes

- Add more translations to fr-FR ([#1529](https://github.com/clerkinc/javascript/pull/1529)) by [@PierreC1024](https://github.com/PierreC1024)

- New localization keys for max length exceeded validation: ([#1521](https://github.com/clerkinc/javascript/pull/1521)) by [@nikospapcom](https://github.com/nikospapcom)

  - Organization name (form_param_max_length_exceeded\_\_name)
  - First name (form_param_max_length_exceeded\_\_first_name)
  - Last name (form_param_max_length_exceeded\_\_last_name)

- Updated dependencies [[`ea95525a4`](https://github.com/clerkinc/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerkinc/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerkinc/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerkinc/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerkinc/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0

## 1.24.0

### Minor Changes

- Introduce sk-SK localization ([#1515](https://github.com/clerkinc/javascript/pull/1515)) by [@l0st0](https://github.com/l0st0)

## 1.23.2

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerkinc/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 1.23.1

### Patch Changes

- Update de-DE localization file ([#1496](https://github.com/clerkinc/javascript/pull/1496)) by [@mwerder](https://github.com/mwerder)

- Updated dependencies [[`2a9d83280`](https://github.com/clerkinc/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 1.23.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerkinc/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)

  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

- Add el-GR localization ([#1479](https://github.com/clerkinc/javascript/pull/1479)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

### Patch Changes

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerkinc/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Add missing "delete account" French translations ([#1487](https://github.com/clerkinc/javascript/pull/1487)) by [@selimjouan](https://github.com/selimjouan)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerkinc/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerkinc/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerkinc/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerkinc/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`592911196`](https://github.com/clerkinc/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0

## 1.22.1

### Patch Changes

- Introduce Polish localization (pl-PL) ([#1457](https://github.com/clerkinc/javascript/pull/1457)) by [@teceer](https://github.com/teceer)

## 1.22.0

### Minor Changes

- Add vi-VN translations ([#1409](https://github.com/clerkinc/javascript/pull/1409)) by [@kungfu321](https://github.com/kungfu321)

### Patch Changes

- Add missing translations in de-DE.ts ([#1414](https://github.com/clerkinc/javascript/pull/1414)) by [@Yardie83](https://github.com/Yardie83)

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 1.21.1

### Patch Changes

- Add missing `fr-FR` translations for reset password page ([#1398](https://github.com/clerkinc/javascript/pull/1398)) by [@kohort-aymeric](https://github.com/kohort-aymeric)

- Make resend link/code message clearer. ([#1390](https://github.com/clerkinc/javascript/pull/1390)) by [@desiprisg](https://github.com/desiprisg)

- Add missing pt-BR translations ([#1388](https://github.com/clerkinc/javascript/pull/1388)) by [@Gustavo-Pauli](https://github.com/Gustavo-Pauli)

## 1.21.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerkinc/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 1.20.1

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 1.20.0

### Minor Changes

- Add localization keys for when the phone number exists and the last identification is deleted ([#1383](https://github.com/clerkinc/javascript/pull/1383)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Add missing fr-FR translations (use_email & use_phone) ([#1379](https://github.com/clerkinc/javascript/pull/1379)) by [@kohort-aymeric](https://github.com/kohort-aymeric)

- Updated dependencies [[`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 1.19.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerkinc/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

- Introduce `nb-NO` localization ([#1376](https://github.com/clerkinc/javascript/pull/1376)) by [@Richard87](https://github.com/Richard87)

### Patch Changes

- Fix "Sign in" text for the Korean localization ([#1371](https://github.com/clerkinc/javascript/pull/1371)) by [@perkinsjr](https://github.com/perkinsjr)

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 1.18.1

### Patch Changes

- Add more fr-FR translations ([#1364](https://github.com/clerkinc/javascript/pull/1364)) by [@selimjouan](https://github.com/selimjouan)

## 1.18.0

### Minor Changes

- feat(localizations): Add ko-KR localization ([#1339](https://github.com/clerkinc/javascript/pull/1339)) by [@deutschkihun](https://github.com/deutschkihun)

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963)]:
  - @clerk/types@3.42.0

## 1.17.1

### Patch Changes

- fix(types,localizations): Improve invalid form email_address param error message by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1

## [1.17.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.17.0-staging.2...@clerk/localizations@1.17.0) (2023-06-03)

### Features

- add zh-CN localization ([#1284](https://github.com/clerkinc/javascript/issues/1284)) ([bc3ba51](https://github.com/clerkinc/javascript/commit/bc3ba51dae2c9ee46138cfe65194ea4a78d5ce36))

### Bug Fixes

- **localizations:** Export zhCN ([b67d523](https://github.com/clerkinc/javascript/commit/b67d5234bf0a84217b1cf5cae439c6089912f9ee))

## [1.16.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.16.0-staging.0...@clerk/localizations@1.16.0) (2023-05-26)

**Note:** Version bump only for package @clerk/localizations

### [1.15.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.15.1-staging.2...@clerk/localizations@1.15.1) (2023-05-23)

**Note:** Version bump only for package @clerk/localizations

## [1.15.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.15.0-staging.0...@clerk/localizations@1.15.0) (2023-05-18)

**Note:** Version bump only for package @clerk/localizations

## [1.14.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.14.0-staging.1...@clerk/localizations@1.14.0) (2023-05-17)

**Note:** Version bump only for package @clerk/localizations

## [1.13.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.13.0-staging.3...@clerk/localizations@1.13.0) (2023-05-15)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.12.0-staging.4...@clerk/localizations@1.12.0) (2023-05-04)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.12.0-staging.3...@clerk/localizations@1.12.0-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.12.0-staging.2...@clerk/localizations@1.12.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerkinc/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerkinc/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerkinc/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerkinc/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))

### Bug Fixes

- **clerk-js:** Reset Password missing localization keys ([b1df074](https://github.com/clerkinc/javascript/commit/b1df074ad203e07b55b0051c9f97d4fd26e0fde5))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerkinc/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))
- **localizations:** Make emailAddresses GE translation consistent ([#1117](https://github.com/clerkinc/javascript/issues/1117)) ([0e84519](https://github.com/clerkinc/javascript/commit/0e84519316c43770b2174c17a412854c335a3643))

### [1.11.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.11.3-staging.0...@clerk/localizations@1.11.3) (2023-04-19)

**Note:** Version bump only for package @clerk/localizations

### [1.11.2](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.11.1...@clerk/localizations@1.11.2) (2023-04-19)

**Note:** Version bump only for package @clerk/localizations

### [1.11.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.11.1-staging.0...@clerk/localizations@1.11.1) (2023-04-12)

**Note:** Version bump only for package @clerk/localizations

## [1.11.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.11.0-staging.2...@clerk/localizations@1.11.0) (2023-04-11)

**Note:** Version bump only for package @clerk/localizations

## [1.10.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.10.0-staging.0...@clerk/localizations@1.10.0) (2023-04-06)

**Note:** Version bump only for package @clerk/localizations

### [1.9.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.9.1-staging.2...@clerk/localizations@1.9.1) (2023-03-31)

**Note:** Version bump only for package @clerk/localizations

## [1.9.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.9.0-staging.0...@clerk/localizations@1.9.0) (2023-03-29)

**Note:** Version bump only for package @clerk/localizations

### [1.7.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.7.1-staging.2...@clerk/localizations@1.7.1) (2023-03-10)

**Note:** Version bump only for package @clerk/localizations

## [1.7.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.7.0-staging.0...@clerk/localizations@1.7.0) (2023-03-09)

**Note:** Version bump only for package @clerk/localizations

## [1.6.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.6.0-staging.0...@clerk/localizations@1.6.0) (2023-03-07)

**Note:** Version bump only for package @clerk/localizations

### [1.5.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.5.3-staging.1...@clerk/localizations@1.5.3) (2023-03-03)

**Note:** Version bump only for package @clerk/localizations

### [1.5.2](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.5.2-staging.0...@clerk/localizations@1.5.2) (2023-03-01)

**Note:** Version bump only for package @clerk/localizations

### [1.5.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.5.1-staging.0...@clerk/localizations@1.5.1) (2023-02-25)

**Note:** Version bump only for package @clerk/localizations

## [1.5.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.5.0-staging.1...@clerk/localizations@1.5.0) (2023-02-24)

### Features

- **localizations:** Improve de-DE translations ([#796](https://github.com/clerkinc/javascript/issues/796)) ([8d595a5](https://github.com/clerkinc/javascript/commit/8d595a549c6b6c79c9dbfb2460119d7aaa32b66b))

## [1.5.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.5-staging.1...@clerk/localizations@1.5.0-staging.0) (2023-02-22)

### Features

- **localizations:** Add spanish localization ([2379cde](https://github.com/clerkinc/javascript/commit/2379cdecbb98a58c761b499a465fc457d852ba4d))
- **localizations:** Add spanish localization ([381a6c1](https://github.com/clerkinc/javascript/commit/381a6c19788ecdd9e435e826d10a5ebd36e6b326))
- **localizations:** Add spanish localization ([97a6208](https://github.com/clerkinc/javascript/commit/97a620885a15744f5116021262aa9daae9257268))

### [1.4.4](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.4-staging.0...@clerk/localizations@1.4.4) (2023-02-17)

**Note:** Version bump only for package @clerk/localizations

### [1.4.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.3-staging.1...@clerk/localizations@1.4.3) (2023-02-15)

**Note:** Version bump only for package @clerk/localizations

### [1.4.2](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.2-staging.1...@clerk/localizations@1.4.2) (2023-02-10)

**Note:** Version bump only for package @clerk/localizations

### [1.4.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.1-staging.0...@clerk/localizations@1.4.1) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

### [1.4.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.4.0...@clerk/localizations@1.4.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

## [1.4.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.3.2-staging.1...@clerk/localizations@1.4.0) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

### [1.3.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.3.1-staging.1...@clerk/localizations@1.3.1) (2023-02-01)

**Note:** Version bump only for package @clerk/localizations

## [1.3.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.3.0-staging.0...@clerk/localizations@1.3.0) (2023-01-27)

**Note:** Version bump only for package @clerk/localizations

### [1.2.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.2.3-staging.0...@clerk/localizations@1.2.3) (2023-01-24)

**Note:** Version bump only for package @clerk/localizations

### [1.2.2](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.2.1...@clerk/localizations@1.2.2) (2023-01-20)

**Note:** Version bump only for package @clerk/localizations

### [1.2.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.2.1-staging.2...@clerk/localizations@1.2.1) (2023-01-17)

**Note:** Version bump only for package @clerk/localizations

## [1.2.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.2.0-staging.0...@clerk/localizations@1.2.0) (2022-12-23)

**Note:** Version bump only for package @clerk/localizations

### [1.1.5](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.5-staging.1...@clerk/localizations@1.1.5) (2022-12-19)

**Note:** Version bump only for package @clerk/localizations

### [1.1.4](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.4-staging.0...@clerk/localizations@1.1.4) (2022-12-13)

**Note:** Version bump only for package @clerk/localizations

### [1.1.3](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.2...@clerk/localizations@1.1.3) (2022-12-12)

**Note:** Version bump only for package @clerk/localizations

### [1.1.2](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.2-staging.1...@clerk/localizations@1.1.2) (2022-12-09)

**Note:** Version bump only for package @clerk/localizations

### [1.1.1](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.0...@clerk/localizations@1.1.1) (2022-12-08)

**Note:** Version bump only for package @clerk/localizations

## [1.1.0](https://github.com/clerkinc/javascript/compare/@clerk/localizations@1.1.0-staging.0...@clerk/localizations@1.1.0) (2022-12-08)

**Note:** Version bump only for package @clerk/localizations
