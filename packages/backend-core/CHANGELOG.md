# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.6.1...@clerk/backend-core@0.7.0) (2022-03-22)


### Features

* **backend-core:** Fix JWTPayload type with Clerk specifications ([2144577](https://github.com/clerkinc/javascript/commit/2144577c8fff668ba872073e89ed17e33460ef82))


### Bug Fixes

* **clerk-js:** Add createdUserId attribute to SignUp ([#132](https://github.com/clerkinc/javascript/issues/132)) ([e530c75](https://github.com/clerkinc/javascript/commit/e530c75fb05fd22caca4054a2e2ae0cb5e468476))



### [0.6.1](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.6.0...@clerk/backend-core@0.6.1) (2022-03-14)


### Bug Fixes

* **clerk-sdk-node:** Properly stringify metadata params in InvitationsAPI ([5fde7cb](https://github.com/clerkinc/javascript/commit/5fde7cbfe2f439d7531a937651351f29523b0dd7))



## [0.6.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.5.2...@clerk/backend-core@0.6.0) (2022-03-11)


### Features

* **types:** Support for oauth_apple ([57b675c](https://github.com/clerkinc/javascript/commit/57b675c762187d1f16cde6d2577bac71f7993438))


### Bug Fixes

* **backend-core:** Correctly use the forwarded-proto value ([1dddf13](https://github.com/clerkinc/javascript/commit/1dddf134c2342480d2b406220acffb5fdd54a400))
* **backend-core:** Make sure to check cross-origin in more cases ([db2360d](https://github.com/clerkinc/javascript/commit/db2360d84fbc9ce4cf62e0698099b59ad4bfc83c))
* **backend-core:** More robust cross-origin check for dev/prod ([234ac48](https://github.com/clerkinc/javascript/commit/234ac487f56f235760449c755ed29869b511acab))



### [0.5.2](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.5.2-staging.0...@clerk/backend-core@0.5.2) (2022-03-09)

**Note:** Version bump only for package @clerk/backend-core





### [0.5.1](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.5.0...@clerk/backend-core@0.5.1) (2022-03-04)


### Bug Fixes

* **backend-core:** Add JWTPayload orgs claim type ([32bb54d](https://github.com/clerkinc/javascript/commit/32bb54d76339e3fbef6ce29bc9e77dd6ebc51b3b))



## [0.5.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.4...@clerk/backend-core@0.5.0) (2022-03-04)


### Features

* **backend-core:** Organizations API ([f4dde55](https://github.com/clerkinc/javascript/commit/f4dde550190d3b4f894e17f5784c29f934daab40))



### [0.4.4](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.4-staging.0...@clerk/backend-core@0.4.4) (2022-02-24)

**Note:** Version bump only for package @clerk/backend-core





### [0.4.4-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.3...@clerk/backend-core@0.4.4-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/backend-core





### [0.4.3](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.2...@clerk/backend-core@0.4.3) (2022-02-16)


### Bug Fixes

* **backend-core:** Include tslib independently ([9511d3e](https://github.com/clerkinc/javascript/commit/9511d3ef5c1f3e862926ee764134056274e1334a))



### [0.4.2](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.1...@clerk/backend-core@0.4.2) (2022-02-16)


### Bug Fixes

* **backend-core:** Allow username and unsafeMetadata updates via BAPI ([#45](https://github.com/clerkinc/javascript/issues/45)) ([bc89674](https://github.com/clerkinc/javascript/commit/bc8967405ff7ce51bbce32a4686aa64c87c12fed))



### [0.4.1](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.1-staging.0...@clerk/backend-core@0.4.1) (2022-02-14)

**Note:** Version bump only for package @clerk/backend-core





### [0.4.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.4.0...@clerk/backend-core@0.4.1-staging.0) (2022-02-11)


### Features

* **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerkinc/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))



## [0.4.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.3.0...@clerk/backend-core@0.4.0) (2022-02-03)


### Features

* **backend-core:** Support for skipPasswordChecks param during user creation ([79798ce](https://github.com/clerkinc/javascript/commit/79798ce1deab13e2272579919848a81c682a0590))



## [0.3.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.2.2...@clerk/backend-core@0.3.0) (2022-02-02)


### Features

* **backend-core,clerk-sdk-node,edge:** Add support to verify azp session token claim ([eab1c8c](https://github.com/clerkinc/javascript/commit/eab1c8c8a43960fee2da9c10a52c3915cd37f45c))


### Bug Fixes

* **backend-core:** Add [@throws](https://github.com/throws) jsdoc ([a7edf92](https://github.com/clerkinc/javascript/commit/a7edf923b4fe0bd1bbbfff540c1c870b6aa081b0))
* **backend-core:** Correct handling of expired tokens ([bf7ed36](https://github.com/clerkinc/javascript/commit/bf7ed361e0a8ee4bf1fb539fd98e8e650cae6209))



### [0.2.2](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.2.1...@clerk/backend-core@0.2.2) (2022-01-28)


### Bug Fixes

* **backend-core:** Remove the no-referrer check for interstitial ([4853caa](https://github.com/clerkinc/javascript/commit/4853caaf859b918faea66d83ec5c8aa430f09d9a))



### [0.2.1](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.2.0...@clerk/backend-core@0.2.1) (2022-01-26)


### Bug Fixes

* **backend-core:** Address the case for cross-origin development in authState ([fd6dc37](https://github.com/clerkinc/javascript/commit/fd6dc37a49c04b191889d32441bc9345bee01362))
* **backend-core:** Enhancement of the auth state algorithm ([27caa19](https://github.com/clerkinc/javascript/commit/27caa1988e12d0b2562bb97c04439adc0467983d))



## [0.2.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.1.1...@clerk/backend-core@0.2.0) (2022-01-25)


### Features

* **backend-core:** Add Web3Wallet support ([220e438](https://github.com/clerkinc/javascript/commit/220e438e6b7be2bb39849dfd8492b3dbf4909f43))


### Bug Fixes

* **backend-core:** Additional exp skew checks ([4ebfcc9](https://github.com/clerkinc/javascript/commit/4ebfcc9bc1852230e57671b02d3f57b9b6ef04c9))
* **backend-core:** Consistent error messages ([f4a4805](https://github.com/clerkinc/javascript/commit/f4a4805136233a9d491be1ae8691091151418107))
* **backend-core:** Correct Nullable export ([1395691](https://github.com/clerkinc/javascript/commit/1395691360ad52fb236ea1f2917289c9e317751d))
* **backend-core:** Remove nbf check temporarily ([1a6229a](https://github.com/clerkinc/javascript/commit/1a6229a66ed980fddc60ee5cbd026cb5cf6cf7bb))


### Reverts

* Revert "chore(release): Publish" ([df705e0](https://github.com/clerkinc/javascript/commit/df705e011f025e044c61aad2983e90afd94d5662))



### [0.1.1](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.1.0...@clerk/backend-core@0.1.1) (2022-01-20)


### Bug Fixes

* **backend-core:** Fix User resource attributes - unsafeMetadata ([c566647](https://github.com/clerkinc/javascript/commit/c5666476908f0b4477f277d8e26bc53c28da8249))



## [0.1.0](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.1.0-alpha.3...@clerk/backend-core@0.1.0) (2022-01-20)

**Note:** Version bump only for package @clerk/backend-core





## [0.1.0-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.1.0-alpha.2...@clerk/backend-core@0.1.0-alpha.3) (2022-01-20)


### Bug Fixes

* **backend-core:** Fix build issue ([2b60c40](https://github.com/clerkinc/javascript/commit/2b60c409fc450c77aa9585e96131de11f5924f50))



## [0.1.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/backend-core@0.1.0-alpha.1...@clerk/backend-core@0.1.0-alpha.2) (2022-01-20)


### Bug Fixes

* **backend-core:** Add Readme links ([12509e3](https://github.com/clerkinc/javascript/commit/12509e32f6da37902cce94949459edffa4a63718))



## 0.1.0-alpha.1 (2022-01-20)


### Features

* Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerkinc/javascript/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
* Consistent imports rule ([fb81176](https://github.com/clerkinc/javascript/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
* Init ([bd27622](https://github.com/clerkinc/javascript/commit/bd2762201f2771f137ddddd50487813c3154938e))
* Init :fire: ([ce185fe](https://github.com/clerkinc/javascript/commit/ce185fefe20f9dcbc17e36506287af224f2cfc2e))
* SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerkinc/javascript/commit/6a323175f9361c32192a4a6be4139b88945a857c))
* Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerkinc/javascript/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))


### Bug Fixes

* **backend-core:** Fix cross-origin detection algorithm ([fd99eae](https://github.com/clerkinc/javascript/commit/fd99eae111469c5d0028fd46b8bcbf1c5a8325b0))
* Remove coverage folder ([e009e7d](https://github.com/clerkinc/javascript/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))



## 0.1.0-alpha.0 (2022-01-20)


### Features

* Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerkinc/javascript/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
* Consistent imports rule ([fb81176](https://github.com/clerkinc/javascript/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
* Init ([bd27622](https://github.com/clerkinc/javascript/commit/bd2762201f2771f137ddddd50487813c3154938e))
* Init :fire: ([ce185fe](https://github.com/clerkinc/javascript/commit/ce185fefe20f9dcbc17e36506287af224f2cfc2e))
* SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerkinc/javascript/commit/6a323175f9361c32192a4a6be4139b88945a857c))
* Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerkinc/javascript/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))


### Bug Fixes

* Remove coverage folder ([e009e7d](https://github.com/clerkinc/javascript/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))



## 0.0.1 (2022-01-20)


### Features

* First version 🎊
