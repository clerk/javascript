# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.17.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.17.0...@clerk/clerk-js@2.17.1) (2022-03-04)


### Bug Fixes

* **clerk-react,clerk-js,types:** Crate of API feedback fixes ([721ce72](https://github.com/clerkinc/javascript/commit/721ce7228c37b012891b2bec8caf290239164d05))



## [2.17.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.16.1...@clerk/clerk-js@2.17.0) (2022-03-04)


### Features

* **clerk-js,clerk-react:** GetOrganization/s hook methods, fetching mechanism alignment ([fc11087](https://github.com/clerkinc/javascript/commit/fc110874f9a3e056cd43c773c267409dd9b318d6))
* **clerk-js:** Add more attributes on organization models ([af010ba](https://github.com/clerkinc/javascript/commit/af010bac4b6e0519eff42d210049c7b3a6bda203))
* **clerk-js:** Add organization basic resources ([09f9012](https://github.com/clerkinc/javascript/commit/09f90126282f757cee6f97e7eae8747abc641bb0))
* **clerk-js:** Add useOrganization hook ([480c422](https://github.com/clerkinc/javascript/commit/480c422774472fc712afdfe6ded2677b458d3ef0))
* **clerk-js:** Basic organization data shape tests ([0ca9a31](https://github.com/clerkinc/javascript/commit/0ca9a3114b34bfaa338e6e90f1b0d57e02b7dd58))
* **clerk-js:** Invitation flow draft ([d6faaab](https://github.com/clerkinc/javascript/commit/d6faaabb7efec09a699c7e83ba24fd4bad199d6b))
* **clerk-js:** Sign up next draft and fixes ([e2eef78](https://github.com/clerkinc/javascript/commit/e2eef782d644f7fd1925fee67ee81d27473255fc))
* **clerk-js:** SignUp with organization invitation flow draft ([2a9edbd](https://github.com/clerkinc/javascript/commit/2a9edbd52916f9bc037f266d1f96269cf54023cb))
* **clerk-react,clerk-js:** Add useOrganization hook using __unstable attribute ([1635132](https://github.com/clerkinc/javascript/commit/16351321a99945d167cbf6e6ca0efdbbbf7efe5a))


### Bug Fixes

* **clerk-js:** Don't use ResizeObserver on old browsers ([581c5cd](https://github.com/clerkinc/javascript/commit/581c5cde9df542b7dcb6d69f61feaf480f7a0075))
* **types:** Guarantee elements not in oauth sorting array will be sorted last ([f3c2869](https://github.com/clerkinc/javascript/commit/f3c2869bc244fc594522ef8f889055f82d31463f))



### [2.16.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.16.0...@clerk/clerk-js@2.16.1) (2022-03-03)


### Bug Fixes

* **types:** Consolidate oauth provider types ([bce9ef5](https://github.com/clerkinc/javascript/commit/bce9ef5cbfe02e11fe71db3e34dbf4fd9be9c3ed))



## [2.16.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.15.0...@clerk/clerk-js@2.16.0) (2022-03-02)


### Features

* **types,clerk-js:** Introduce Notion OAuth ([#72](https://github.com/clerkinc/javascript/issues/72)) ([9e556d0](https://github.com/clerkinc/javascript/commit/9e556d00fb41dedbbd05de59947d00c720bb3d95))


### Bug Fixes

* **clerk-js:** Clear invalid invitation token value ([0c5dc85](https://github.com/clerkinc/javascript/commit/0c5dc85bd69b1050bf36e7108b38868e22022e61))



## [2.15.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3...@clerk/clerk-js@2.15.0) (2022-03-01)


### Features

* **types:** Add support for oauth_microsoft ([96c1cc6](https://github.com/clerkinc/javascript/commit/96c1cc6817b9bbc6917ea2773498299c1ff9b951))



### [2.14.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.3-staging.0...@clerk/clerk-js@2.14.3) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-js





### [2.14.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.2-staging.0...@clerk/clerk-js@2.14.3-staging.0) (2022-02-24)


### Features

* **clerk-js:** Introduce `UserSettings.instanceIsPasswordBased` ([f72a555](https://github.com/clerkinc/javascript/commit/f72a555f6adb38870539e9bab63cb638c04517d6))


### Bug Fixes

* **clerk-js,clerk-react:** Revert user settings work ([9a70576](https://github.com/clerkinc/javascript/commit/9a70576d1a47f01e6dbbfd8704f321daddcfe590))
* **clerk-js:** Helpful error message for sign in without factors ([9d8a050](https://github.com/clerkinc/javascript/commit/9d8a050d975fddb3e3163781d010138a888b7bf2))
* **clerk-js:** Import Clerk CSS after shared css modules/ components ([dde2f3b](https://github.com/clerkinc/javascript/commit/dde2f3b87a0e177967ce13f087806ebff2084ff5))
* **clerk-js:** Render instant password field for password-based instances only ([586437f](https://github.com/clerkinc/javascript/commit/586437f238723da6f03119e2069989eaabe48ddd))
* **clerk-js:** Render instant password field for password-based instances only ([a9eefc9](https://github.com/clerkinc/javascript/commit/a9eefc967d4745a54aee0c917ce707b1a51df1be))



### [2.14.2-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.1-staging.0...@clerk/clerk-js@2.14.2-staging.0) (2022-02-22)


### Features

* **clerk-js:** Allow passing of object style search params on fapiclient ([8144779](https://github.com/clerkinc/javascript/commit/8144779e37ca4b0a61ac1d452ddd0ab7ccf40f27))



### [2.14.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.14.0-staging.0...@clerk/clerk-js@2.14.1-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-js





## [2.14.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.3-staging.0...@clerk/clerk-js@2.14.0-staging.0) (2022-02-16)


### Features

* **clerk-js:** Import all resources from internal.ts ([#44](https://github.com/clerkinc/javascript/issues/44)) ([5b8f6f8](https://github.com/clerkinc/javascript/commit/5b8f6f81ed3d823840a0c4d3edcbd3c8298d7d42))



### [2.13.3-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.2...@clerk/clerk-js@2.13.3-staging.0) (2022-02-15)


### Features

* **clerk-js:** Introduce with `userSettings` in `SignIn` ([adccb35](https://github.com/clerkinc/javascript/commit/adccb35377b6455285dc11cbfabe0710c9035c3f))
* **clerk-js:** Introduce with `userSettings` in `UserProfile` ([62dff26](https://github.com/clerkinc/javascript/commit/62dff26d56c7a699d0db074e863a89ddf2ee86a7))
* **clerk-js:** Refactor signUp utils to work with userSettings ([0eb3352](https://github.com/clerkinc/javascript/commit/0eb3352cf93c35eb5de162822802124248cef840))
* **types:** Introduce 'UserSettingsResource' ([32fcf04](https://github.com/clerkinc/javascript/commit/32fcf0477e6db4851f4de50904c02868ba1790ee))



### [2.13.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.1...@clerk/clerk-js@2.13.2) (2022-02-14)


### Bug Fixes

* **clerk-js:** Remove unnecessary type assertions ([f580d4a](https://github.com/clerkinc/javascript/commit/f580d4aebfc3938ca152e7cbc529a8c948e0c311))



### [2.13.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-js@2.13.1-staging.0...@clerk/clerk-js@2.13.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-js





### 2.13.1-staging.0 (2022-02-11)


### Bug Fixes

* **clerk-js:** Prevent post auth redirects in Metamask flow ([#31](https://github.com/clerkinc/javascript/issues/31)) ([052ff1e](https://github.com/clerkinc/javascript/commit/052ff1e74ad76fd97010e6d899e0eb2acb1d717c))
