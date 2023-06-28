# Change Log

## 4.10.13

### Patch Changes

- Updated dependencies [[`30f8ad18a`](https://github.com/clerkinc/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1
  - @clerk/backend@0.23.6

## 4.10.12

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerkinc/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0
  - @clerk/backend@0.23.5

## 4.10.11

### Patch Changes

- Simplify the signature of the low-level `authenticateRequest` helper. ([#1329](https://github.com/clerkinc/javascript/pull/1329)) by [@anagstef](https://github.com/anagstef)

  - One pair of legacy or new instance keys are required instead of all 4 of them in `authenticateRequest`
  - `@clerk/backend` now can handle the `"Bearer "` prefix in Authorization header for better DX
  - `host` parameter is now optional in `@clerk/backend`

- Updated dependencies [[`11954816`](https://github.com/clerkinc/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`de2347f9`](https://github.com/clerkinc/javascript/commit/de2347f9efaab4903787a905528a06551a9b7883), [`32148490`](https://github.com/clerkinc/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0
  - @clerk/backend@0.23.4

## 4.10.10

### Patch Changes

- Updated dependencies [[`17cc14ec`](https://github.com/clerkinc/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0
  - @clerk/backend@0.23.3

## 4.10.9

### Patch Changes

- Fix ESM build issues ([#1377](https://github.com/clerkinc/javascript/pull/1377)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 4.10.8

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerkinc/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerkinc/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0
  - @clerk/backend@0.23.2

## 4.10.7

### Patch Changes

- Correctly display "Missing Clerk keys" error instead of simply throwing during initialization ([#1365](https://github.com/clerkinc/javascript/pull/1365)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Allow `clerkJSVersion` to be passed when loading interstitial. Support for ([#1354](https://github.com/clerkinc/javascript/pull/1354)) by [@panteliselef](https://github.com/panteliselef)

  - Nextjs
  - Remix
  - Node

- Updated dependencies [[`b945c921`](https://github.com/clerkinc/javascript/commit/b945c92100454f00ff4b6b9c769201ca2ceaac93)]:
  - @clerk/backend@0.23.1

## 4.10.6

### Patch Changes

- Load env variables upon first usage of middlewares or clerkClient ([#1230](https://github.com/clerkinc/javascript/pull/1230)) by [@dimkl](https://github.com/dimkl)

## 4.10.5

### Patch Changes

- Support `audience` parameter in authentication request ([#1004](https://github.com/clerkinc/javascript/pull/1004)) by [@dimkl](https://github.com/dimkl)

  The audience parameter is used to verify the the aud claim in
  the request matches the value of the parameter or is included
  (when the user provides a list).

  Resolves:

  - [#978](https://github.com/clerkinc/javascript/pull/978)
  - [#1004](https://github.com/clerkinc/javascript/pull/1004)

- Updated dependencies [[`c42b4ac0`](https://github.com/clerkinc/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`010484f4`](https://github.com/clerkinc/javascript/commit/010484f4978b9616e8c2ef50986eda742c4967bd)]:
  - @clerk/types@3.42.0
  - @clerk/backend@0.23.0

## 4.10.4

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerkinc/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/backend@0.22.0
  - @clerk/types@3.41.1

## [4.10.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.10.0-staging.2...@clerk/clerk-sdk-node@4.10.0) (2023-05-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.9.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.9.2-staging.1...@clerk/clerk-sdk-node@4.9.2) (2023-05-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.9.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.9.1-staging.1...@clerk/clerk-sdk-node@4.9.1) (2023-05-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.8-staging.3...@clerk/clerk-sdk-node@4.9.0) (2023-05-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.4...@clerk/clerk-sdk-node@4.8.7) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.3...@clerk/clerk-sdk-node@4.8.7-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.7-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.7-staging.2...@clerk/clerk-sdk-node@4.8.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.6-staging.0...@clerk/clerk-sdk-node@4.8.6) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.4...@clerk/clerk-sdk-node@4.8.5) (2023-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.4-staging.0...@clerk/clerk-sdk-node@4.8.4) (2023-04-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.3-staging.3...@clerk/clerk-sdk-node@4.8.3) (2023-04-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.2-staging.0...@clerk/clerk-sdk-node@4.8.2) (2023-04-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.1-staging.3...@clerk/clerk-sdk-node@4.8.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.8.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.1-staging.0...@clerk/clerk-sdk-node@4.8.1-staging.1) (2023-03-31)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.8.0-staging.0...@clerk/clerk-sdk-node@4.8.0) (2023-03-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.11-staging.2...@clerk/clerk-sdk-node@4.7.11) (2023-03-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.10-staging.1...@clerk/clerk-sdk-node@4.7.10) (2023-03-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.9-staging.1...@clerk/clerk-sdk-node@4.7.9) (2023-03-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.8-staging.1...@clerk/clerk-sdk-node@4.7.8) (2023-03-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.7-staging.0...@clerk/clerk-sdk-node@4.7.7) (2023-03-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.6-staging.0...@clerk/clerk-sdk-node@4.7.6) (2023-02-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.5-staging.7...@clerk/clerk-sdk-node@4.7.5) (2023-02-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.5-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.5-staging.3...@clerk/clerk-sdk-node@4.7.5-staging.4) (2023-02-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.4-staging.1...@clerk/clerk-sdk-node@4.7.4) (2023-02-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.3-staging.2...@clerk/clerk-sdk-node@4.7.3) (2023-02-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.2-staging.1...@clerk/clerk-sdk-node@4.7.2) (2023-02-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.1-staging.0...@clerk/clerk-sdk-node@4.7.1) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.7.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.0-staging.1...@clerk/clerk-sdk-node@4.7.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.7.0-staging.1...@clerk/clerk-sdk-node@4.7.0) (2023-02-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.5-staging.4...@clerk/clerk-sdk-node@4.6.5) (2023-02-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.4-staging.4...@clerk/clerk-sdk-node@4.6.4) (2023-01-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.3-staging.1...@clerk/clerk-sdk-node@4.6.3) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerkinc/javascript/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [4.6.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.1...@clerk/clerk-sdk-node@4.6.2) (2023-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.6.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.1-staging.0...@clerk/clerk-sdk-node@4.6.1) (2023-01-18)

### Bug Fixes

- **clerk-sdk-node:** Remove unused jsonwebtoken dependency ([6af3d9e](https://github.com/clerkinc/javascript/commit/6af3d9ea7e2d47f07f65c1133e634986b048bf74))

## [4.6.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.6.0-staging.8...@clerk/clerk-sdk-node@4.6.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerkinc/javascript/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))

### [4.5.14](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.14-staging.1...@clerk/clerk-sdk-node@4.5.14) (2022-12-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.13](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.13-staging.1...@clerk/clerk-sdk-node@4.5.13) (2022-12-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.12](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.11...@clerk/clerk-sdk-node@4.5.12) (2022-12-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.11-staging.1...@clerk/clerk-sdk-node@4.5.11) (2022-12-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.9...@clerk/clerk-sdk-node@4.5.10) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.9-staging.0...@clerk/clerk-sdk-node@4.5.9) (2022-12-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.8-staging.0...@clerk/clerk-sdk-node@4.5.8) (2022-12-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.7-staging.4...@clerk/clerk-sdk-node@4.5.7) (2022-11-30)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.7-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.7-staging.3...@clerk/clerk-sdk-node@4.5.7-staging.4) (2022-11-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.6-staging.0...@clerk/clerk-sdk-node@4.5.6) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.5-staging.0...@clerk/clerk-sdk-node@4.5.5) (2022-11-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.3...@clerk/clerk-sdk-node@4.5.4) (2022-11-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.3-staging.2...@clerk/clerk-sdk-node@4.5.3) (2022-11-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.3-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.3-staging.1...@clerk/clerk-sdk-node@4.5.3-staging.2) (2022-11-21)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.2-staging.1...@clerk/clerk-sdk-node@4.5.2) (2022-11-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.5.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.1-staging.3...@clerk/clerk-sdk-node@4.5.1) (2022-11-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.5.0-staging.1...@clerk/clerk-sdk-node@4.5.0) (2022-11-10)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.7-staging.2...@clerk/clerk-sdk-node@4.4.7) (2022-11-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.7...@clerk/clerk-sdk-node@4.4.6) (2022-11-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.3...@clerk/clerk-sdk-node@4.4.6-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.1...@clerk/clerk-sdk-node@4.4.6-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.6-staging.1...@clerk/clerk-sdk-node@4.4.6-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.6-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.5...@clerk/clerk-sdk-node@4.4.6-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.5-staging.0...@clerk/clerk-sdk-node@4.4.5) (2022-10-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.3...@clerk/clerk-sdk-node@4.4.4) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.3-staging.2...@clerk/clerk-sdk-node@4.4.3) (2022-10-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.3-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.2...@clerk/clerk-sdk-node@4.4.3-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.2-staging.0...@clerk/clerk-sdk-node@4.4.2) (2022-10-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.1-staging.0...@clerk/clerk-sdk-node@4.4.1) (2022-10-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.4.0-staging.5...@clerk/clerk-sdk-node@4.4.0) (2022-10-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.3.3-staging.4...@clerk/clerk-sdk-node@4.3.3) (2022-09-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.3.1...@clerk/clerk-sdk-node@4.3.2) (2022-09-25)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.3.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.3.1-staging.1...@clerk/clerk-sdk-node@4.3.1) (2022-09-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.3.0-staging.0...@clerk/clerk-sdk-node@4.3.0) (2022-09-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.2.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.2.0-staging.4...@clerk/clerk-sdk-node@4.2.1) (2022-09-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.2.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.2.0-staging.4...@clerk/clerk-sdk-node@4.2.0) (2022-09-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.6...@clerk/clerk-sdk-node@4.1.7) (2022-09-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.6-staging.0...@clerk/clerk-sdk-node@4.1.6) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.5-staging.0...@clerk/clerk-sdk-node@4.1.5) (2022-09-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.3...@clerk/clerk-sdk-node@4.1.4) (2022-09-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.3-staging.0...@clerk/clerk-sdk-node@4.1.3) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.2-staging.3...@clerk/clerk-sdk-node@4.1.2) (2022-08-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.1.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.1.1-staging.0...@clerk/clerk-sdk-node@4.1.1) (2022-08-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.1.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.5...@clerk/clerk-sdk-node@4.1.0) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.4...@clerk/clerk-sdk-node@4.0.5) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.4-staging.0...@clerk/clerk-sdk-node@4.0.4) (2022-08-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.2...@clerk/clerk-sdk-node@4.0.3) (2022-08-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.2-staging.0...@clerk/clerk-sdk-node@4.0.2) (2022-08-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [4.0.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.0...@clerk/clerk-sdk-node@4.0.1) (2022-08-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [4.0.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@4.0.0-staging.1...@clerk/clerk-sdk-node@4.0.0) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.9.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.9.1...@clerk/clerk-sdk-node@3.9.2) (2022-08-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.9.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.9.0...@clerk/clerk-sdk-node@3.9.1) (2022-08-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.9.0-staging.0...@clerk/clerk-sdk-node@3.9.0) (2022-07-26)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.5...@clerk/clerk-sdk-node@3.8.6) (2022-07-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.4...@clerk/clerk-sdk-node@3.8.5) (2022-07-08)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.3...@clerk/clerk-sdk-node@3.8.4) (2022-07-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.2...@clerk/clerk-sdk-node@3.8.3) (2022-07-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.8.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.1...@clerk/clerk-sdk-node@3.8.2) (2022-07-04)

### Bug Fixes

- **backend-core,clerk-sdk-node:** Fix parsing issue and defensively check for errors body ([f2f6fe9](https://github.com/clerkinc/javascript/commit/f2f6fe9b093ff3a34ca31c4ff3179841a44355cf))

### [3.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.8.0...@clerk/clerk-sdk-node@3.8.1) (2022-07-01)

### Bug Fixes

- **clerk-sdk-node:** Temporarily disable exports test on release ([da3c5df](https://github.com/clerkinc/javascript/commit/da3c5df7e6bfc57133ea811d37f4da5b006cc3e7))

## [3.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.7.0...@clerk/clerk-sdk-node@3.8.0) (2022-07-01)

### Features

- **clerk-sdk-node:** Add module exports testing ([ad01d27](https://github.com/clerkinc/javascript/commit/ad01d27f6259c1938d4d27df01c9af0a01a34ebf))

## [3.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.2...@clerk/clerk-sdk-node@3.7.0) (2022-06-24)

### Features

- **types,backend-core:** Consolidate Clerk issued JWT claims under ClerkJWTClaims ([e6bc9fb](https://github.com/clerkinc/javascript/commit/e6bc9fb380d38d7f89cc2059e0211b0ad55bd1a5))

### Bug Fixes

- **edge,nextjs,remix,clerk-sdk-node,types:** Correct SSR claims typing ([09c147c](https://github.com/clerkinc/javascript/commit/09c147c196c08e64794423f9eae791bfe453b858))

### [3.6.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.2-staging.0...@clerk/clerk-sdk-node@3.6.2) (2022-06-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.3...@clerk/clerk-sdk-node@3.6.1) (2022-06-06)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.2...@clerk/clerk-sdk-node@3.6.1-staging.3) (2022-06-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.1...@clerk/clerk-sdk-node@3.6.1-staging.2) (2022-06-02)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.6.1-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.1-staging.0...@clerk/clerk-sdk-node@3.6.1-staging.1) (2022-06-01)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.4...@clerk/clerk-sdk-node@3.6.0) (2022-05-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0-staging.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.3...@clerk/clerk-sdk-node@3.6.0-staging.4) (2022-05-20)

### Features

- **backend-core:** New Resource class structure ([fd84550](https://github.com/clerkinc/javascript/commit/fd845509d70f67ed11bdfae998c9a727ab8c6a8d))

## [3.6.0-staging.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.6.0-staging.2...@clerk/clerk-sdk-node@3.6.0-staging.3) (2022-05-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.6.0-staging.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.2) (2022-05-18)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerkinc/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerkinc/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.6.0-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.1) (2022-05-17)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerkinc/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerkinc/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.6.0-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.5.0...@clerk/clerk-sdk-node@3.6.0-staging.0) (2022-05-16)

### Features

- **backend-core:** Retrieve instance organizations ([a24c4d3](https://github.com/clerkinc/javascript/commit/a24c4d3b1459d28cd7f950864d7347a8875d9c9c))
- **clerk-sdk-node:** Export organization invitation ([07ac214](https://github.com/clerkinc/javascript/commit/07ac214ce8604859b359e073ae19e0d713650c22))

## [3.5.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.5.0) (2022-05-13)

### Features

- **clerk-sdk-node:** Organizations operations ([339ecdb](https://github.com/clerkinc/javascript/commit/339ecdbf472df2930ecdddd440cee1b26b32c9bf))

### [3.4.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.4.3) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.4.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.4.1...@clerk/clerk-sdk-node@3.4.2) (2022-05-12)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.4.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.4.1-staging.0...@clerk/clerk-sdk-node@3.4.1) (2022-05-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.4.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.11...@clerk/clerk-sdk-node@3.4.0) (2022-05-06)

### Features

- **nextjs,clerk-sdk-node,remix:** Add claims attribute to req.auth ([c695529](https://github.com/clerkinc/javascript/commit/c695529089f55baef72b86e3b73b8cd9f4f58e6d))

### [3.3.11](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.11-staging.0...@clerk/clerk-sdk-node@3.3.11) (2022-05-05)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.10-staging.0...@clerk/clerk-sdk-node@3.3.10) (2022-04-28)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.8...@clerk/clerk-sdk-node@3.3.9) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.7...@clerk/clerk-sdk-node@3.3.8) (2022-04-27)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.6...@clerk/clerk-sdk-node@3.3.7) (2022-04-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.6-staging.1...@clerk/clerk-sdk-node@3.3.6) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.6-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.6-staging.0...@clerk/clerk-sdk-node@3.3.6-staging.1) (2022-04-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.5-alpha.0...@clerk/clerk-sdk-node@3.3.5) (2022-04-18)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.5-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.4...@clerk/clerk-sdk-node@3.3.5-alpha.0) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.3...@clerk/clerk-sdk-node@3.3.4) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.3-staging.0...@clerk/clerk-sdk-node@3.3.3) (2022-04-15)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.2-staging.0...@clerk/clerk-sdk-node@3.3.2) (2022-04-13)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.3.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.0...@clerk/clerk-sdk-node@3.3.1) (2022-04-07)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.3.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.3.0-staging.0...@clerk/clerk-sdk-node@3.3.0) (2022-04-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.4-staging.0...@clerk/clerk-sdk-node@3.2.4) (2022-03-29)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.3-staging.0...@clerk/clerk-sdk-node@3.2.3) (2022-03-28)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.2-alpha.0...@clerk/clerk-sdk-node@3.2.2) (2022-03-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [3.2.2-staging.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.2-staging.0...@clerk/clerk-sdk-node@3.2.2-staging.1) (2022-03-24)

### Bug Fixes

- **clerk-sdk-node:** Add ServerGetToken on AuthProp enhancers ([8af677c](https://github.com/clerkinc/javascript/commit/8af677c615488aa07f807e2cb0706fb210473e6b))

### [3.2.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.1-staging.0...@clerk/clerk-sdk-node@3.2.1-alpha.0) (2022-03-23)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.2.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.2.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.2) (2022-03-23)

### Features

- **clerk-sdk-node,backend-core:** Add getCount method and correctly document UserListParams ([1a7a398](https://github.com/clerkinc/javascript/commit/1a7a398b2e881f8d3676d62725f3b67eec6d78b4))

## [3.2.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.1) (2022-03-23)

### Features

- **backend-core,clerk-sdk-node,nextjs,remix:** Add injected jwtKey option ([53e56e7](https://github.com/clerkinc/javascript/commit/53e56e76d59984d4d3f5b7e1e2d276adb8b2dc77))

## [3.2.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.1...@clerk/clerk-sdk-node@3.2.0-alpha.0) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.1.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.1.0-alpha.0...@clerk/clerk-sdk-node@3.1.0-alpha.1) (2022-03-22)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [3.1.0-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.1.0-alpha.0) (2022-03-22)

### Features

- **clerk-sdk-node:** Add getToken to sdk-node `auth` ([445def1](https://github.com/clerkinc/javascript/commit/445def148eeaa731dc0b74428d0b9f078e8b9240))
- **clerk-sdk-node:** Enable CLERK_JWT_KEY usage from clerk-sdk-node ([6151101](https://github.com/clerkinc/javascript/commit/61511019e123f7e9eaa9b44f35fa04ef643090be))

### [3.0.1-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.0.1-alpha.1) (2022-03-20)

### Features

- **clerk-sdk-node:** Add getToken to sdk-node `auth` ([445def1](https://github.com/clerkinc/javascript/commit/445def148eeaa731dc0b74428d0b9f078e8b9240))

### [3.0.1-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@3.0.1-staging.0...@clerk/clerk-sdk-node@3.0.1-alpha.0) (2022-03-19)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.10](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.9...@clerk/clerk-sdk-node@2.9.10) (2022-03-14)

### Bug Fixes

- **clerk-sdk-node:** Properly stringify metadata params in InvitationsAPI ([5fde7cb](https://github.com/clerkinc/javascript/commit/5fde7cbfe2f439d7531a937651351f29523b0dd7))

### [2.9.9-alpha.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.8...@clerk/clerk-sdk-node@2.9.9-alpha.0) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.9](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.8...@clerk/clerk-sdk-node@2.9.9) (2022-03-11)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.8](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.7...@clerk/clerk-sdk-node@2.9.8) (2022-03-09)

### Bug Fixes

- **clerk-sdk-node:** Correct initialization params override on custom instance ([4feb7eb](https://github.com/clerkinc/javascript/commit/4feb7eb8be87b2a03c6f5cdd1499982ce7020961))

### [2.9.7](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.7-staging.0...@clerk/clerk-sdk-node@2.9.7) (2022-03-09)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.6](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.5...@clerk/clerk-sdk-node@2.9.6) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.4...@clerk/clerk-sdk-node@2.9.5) (2022-03-04)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.4-staging.0...@clerk/clerk-sdk-node@2.9.4) (2022-02-24)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.4-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.3...@clerk/clerk-sdk-node@2.9.4-staging.0) (2022-02-17)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.2...@clerk/clerk-sdk-node@2.9.3) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.1...@clerk/clerk-sdk-node@2.9.2) (2022-02-16)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.1-staging.0...@clerk/clerk-sdk-node@2.9.1) (2022-02-14)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.9.1-staging.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.9.0...@clerk/clerk-sdk-node@2.9.1-staging.0) (2022-02-11)

### Features

- **clerk-sdk-node:** Deprecate Session named middleware, introduce withAuth, requireAuth ([4e69553](https://github.com/clerkinc/javascript/commit/4e695535e41fe7c135cbf303a0d021e7b7d30f7d))

## [2.9.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.8.1...@clerk/clerk-sdk-node@2.9.0) (2022-02-04)

### Features

- **clerk-sdk-node:** Add custom header X-Clerk-SDK in request for SDK version ([84986d8](https://github.com/clerkinc/javascript/commit/84986d8522c00da3671a19dec7b914f99c3cc133))

### [2.8.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.8.0...@clerk/clerk-sdk-node@2.8.1) (2022-02-03)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [2.8.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.5...@clerk/clerk-sdk-node@2.8.0) (2022-02-02)

### Features

- **backend-core,clerk-sdk-node,edge:** Add support to verify azp session token claim ([eab1c8c](https://github.com/clerkinc/javascript/commit/eab1c8c8a43960fee2da9c10a52c3915cd37f45c))

### [2.7.5](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.4...@clerk/clerk-sdk-node@2.7.5) (2022-01-28)

### Bug Fixes

- **clerk-sdk-node:** Restore the setClerkHttpOptions capability ([ff9f518](https://github.com/clerkinc/javascript/commit/ff9f51860895033f5fe8a4fc12a18b0b204ad472))

### [2.7.4](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.3...@clerk/clerk-sdk-node@2.7.4) (2022-01-26)

### Reverts

- Revert "chore(release): Publish" ([df705e0](https://github.com/clerkinc/javascript/commit/df705e011f025e044c61aad2983e90afd94d5662))

### [2.7.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.2...@clerk/clerk-sdk-node@2.7.3) (2022-01-25)

### Bug Fixes

- **clerk-sdk-node:** Correctly pass responseType on got options for interstitial logic ([6fd58bb](https://github.com/clerkinc/javascript/commit/6fd58bb31083fd28bba06b7224e1d5f30df68bbb))

### Reverts

- Revert "chore(release): Publish" ([df705e0](https://github.com/clerkinc/javascript/commit/df705e011f025e044c61aad2983e90afd94d5662))

### [2.7.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.1...@clerk/clerk-sdk-node@2.7.2) (2022-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

### [2.7.1](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.0...@clerk/clerk-sdk-node@2.7.1) (2022-01-20)

### Bug Fixes

- **clerk-sdk-node:** Restore verifyToken utility ([e22ef8a](https://github.com/clerkinc/javascript/commit/e22ef8aa3f4db1e14391f88bb924a82f6b17ba6a))

## [2.7.0](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.3...@clerk/clerk-sdk-node@2.7.0) (2022-01-20)

**Note:** Version bump only for package @clerk/clerk-sdk-node

## [2.7.0-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.2...@clerk/clerk-sdk-node@2.7.0-alpha.3) (2022-01-20)

### Bug Fixes

- **backend-core:** Fix build issue ([2b60c40](https://github.com/clerkinc/javascript/commit/2b60c409fc450c77aa9585e96131de11f5924f50))

## [2.7.0-alpha.2](https://github.com/clerkinc/javascript/compare/@clerk/clerk-sdk-node@2.7.0-alpha.1...@clerk/clerk-sdk-node@2.7.0-alpha.2) (2022-01-20)

### Bug Fixes

- **backend-core:** Add Readme links ([12509e3](https://github.com/clerkinc/javascript/commit/12509e32f6da37902cce94949459edffa4a63718))

## 2.7.0-alpha.1 (2022-01-20)

### Features

- Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerkinc/javascript/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
- Consistent imports rule ([fb81176](https://github.com/clerkinc/javascript/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
- npm workspaces and lerna setup ([cfbfebf](https://github.com/clerkinc/javascript/commit/cfbfebfd0d5f88a96b4715e4be52bff7f37cc3db))
- SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerkinc/javascript/commit/6a323175f9361c32192a4a6be4139b88945a857c))
- Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerkinc/javascript/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))

### Bug Fixes

- **backend-core:** Fix cross-origin detection algorithm ([fd99eae](https://github.com/clerkinc/javascript/commit/fd99eae111469c5d0028fd46b8bcbf1c5a8325b0))
- **clerk-sdk-node:** Correctly apply body deserialization ([fefc084](https://github.com/clerkinc/javascript/commit/fefc084a3680c071a62dfe573cd5e6e2d5d769f3))
- **clerk-sdk-node:** Fix string minor typing ([219c1a1](https://github.com/clerkinc/javascript/commit/219c1a1b9c4cf49cc02c132986db5f08088fafdd))
- **clerk-sdk-node:** Fix version file ([88b4897](https://github.com/clerkinc/javascript/commit/88b4897d74a30cb67b0e39c72eac9e263030f3b2))
- **clerk-sdk-node:** Properly import key from jwk ([e982fd0](https://github.com/clerkinc/javascript/commit/e982fd07bfd3354c108efc14775d03087e816651))
- Remove coverage folder ([e009e7d](https://github.com/clerkinc/javascript/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))

## 2.7.0-alpha.0 (2022-01-20)

### Features

- Add injectable loadCryptoKeyFunction ([637b854](https://github.com/clerkinc/clerk-sdk-node/commit/637b8547447bdfb5f1cac8718d007e665b433f70))
- Consistent imports rule ([fb81176](https://github.com/clerkinc/clerk-sdk-node/commit/fb81176b9db0a95a84d19f61e15a9c65a12fc98e))
- npm workspaces and lerna setup ([cfbfebf](https://github.com/clerkinc/clerk-sdk-node/commit/cfbfebfd0d5f88a96b4715e4be52bff7f37cc3db))
- SDK Node resource and APIs from @clerk/backend-core ([6a32317](https://github.com/clerkinc/clerk-sdk-node/commit/6a323175f9361c32192a4a6be4139b88945a857c))
- Update READMEs, API reference for @clerk/backend-core, minor fixes ([529c2f6](https://github.com/clerkinc/clerk-sdk-node/commit/529c2f629ec02895f9f049d29b5775f16ef5c6e9))

### Bug Fixes

- **clerk-sdk-node:** Correctly apply body deserialization ([fefc084](https://github.com/clerkinc/clerk-sdk-node/commit/fefc084a3680c071a62dfe573cd5e6e2d5d769f3))
- **clerk-sdk-node:** Fix string minor typing ([219c1a1](https://github.com/clerkinc/clerk-sdk-node/commit/219c1a1b9c4cf49cc02c132986db5f08088fafdd))
- **clerk-sdk-node:** Fix version file ([88b4897](https://github.com/clerkinc/clerk-sdk-node/commit/88b4897d74a30cb67b0e39c72eac9e263030f3b2))
- **clerk-sdk-node:** Properly import key from jwk ([e982fd0](https://github.com/clerkinc/clerk-sdk-node/commit/e982fd07bfd3354c108efc14775d03087e816651))
- Remove coverage folder ([e009e7d](https://github.com/clerkinc/clerk-sdk-node/commit/e009e7d794db052cbf74433fb0cf01203cecce4d))

## 2.6.3 (2022-01-20)

### Features

- Switch repo from [https://github.com/clerkinc/clerk-sdk-node/](https://github.com/clerkinc/clerk-sdk-node/) 🎊
