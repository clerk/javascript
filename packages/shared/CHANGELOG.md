# Change Log

## 1.3.1

### Patch Changes

- Fixes a bug where Invitations from `useOrganization` incorrectly depended on options for memberships. ([#2481](https://github.com/clerk/javascript/pull/2481)) by [@clerk-cookie](https://github.com/clerk-cookie)

## 1.3.0

### Minor Changes

- Use both `__clerk_db_jwt` and `__dev_browser` search params to sync dev browser between application and Account Portal in development instances. ([#2431](https://github.com/clerk/javascript/pull/2431)) by [@dimkl](https://github.com/dimkl)

  This change is required to support the next major version of the ClerkJS.

## 1.2.0

### Minor Changes

- Support reading from `__clerk_db_jwt` and `__dev_session` the dev browser jwt in development ([#2428](https://github.com/clerk/javascript/pull/2428)) by [@dimkl](https://github.com/dimkl)

## 1.1.1

### Patch Changes

- Ensure that the interstitial page loads clerk-js@v4. ([#2180](https://github.com/clerk/javascript/pull/2180)) by [@BRKalow](https://github.com/BRKalow)

- Ensure the interstitial loads a clerk-js version that matches the current major version. ([#2180](https://github.com/clerk/javascript/pull/2180)) by [@BRKalow](https://github.com/BRKalow)

## 1.1.0

### Minor Changes

- Expose `revalidate` and `setData` for paginated lists of data in organization hooks. ([#2013](https://github.com/clerk/javascript/pull/2013)) by [@clerk-cookie](https://github.com/clerk-cookie)

  `const {userMemberships:{revalidate, setData}} = useOrganizationList({userMemberships:true})`

- Add a private \_\_navigateWithError util function to clerk for use in User Lockout scenarios ([#2074](https://github.com/clerk/javascript/pull/2074)) by [@clerk-cookie](https://github.com/clerk-cookie)

### Patch Changes

- Fix incorrect pagination counters in data tables inside `<OrganizationProfile/>`. ([#2067](https://github.com/clerk/javascript/pull/2067)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Rename the @staging tag to @canary. Drop support for @next tag. ([#2066](https://github.com/clerk/javascript/pull/2066)) by [@anagstef](https://github.com/anagstef)

## 1.0.2

### Patch Changes

- Remove `"sideEffects": "false"` since the package has side-effects ([#1983](https://github.com/clerk/javascript/pull/1983)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Add clerkTraceId to ClerkBackendApiResponse and ClerkAPIResponseError to allow for better tracing and debugging API error responses. ([#1894](https://github.com/clerk/javascript/pull/1894)) by [@Nikpolik](https://github.com/Nikpolik)

  Uses `clerk_trace_id` when available in a response and defaults to [`cf-ray` identifier](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) if missing.

## 1.0.1

### Patch Changes

- Improve compatibility with Expo ([#1950](https://github.com/clerk/javascript/pull/1950)) by [@LekoArts](https://github.com/LekoArts)

## 1.0.0

### Major Changes

- The package was reworked to allow for better isomorphic use cases and ESM support, resulting in some breaking changes. It now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) and restricts some imports to specific subpaths. ([#1898](https://github.com/clerk/javascript/pull/1898)) by [@LekoArts](https://github.com/LekoArts)

  Instead of importing from the root `@clerk/shared` import you can now use subpaths for most things:

  ```diff
  - import { deprecated, OrganizationProvider } from "@clerk/shared"
  + import { deprecated } from "@clerk/shared/deprecated"
  + import { OrganizationProvider } from "@clerk/shared/react"
  ```

  By using subpaths you can tell bundlers to only bundle specific parts, potentially helping with tree-shaking. It also mitigates issues where e.g. modules only relevant for React where picked up in Node.js-only environments.

  If you're not using `@clerk/shared` directly (only by proxy through e.g. `@clerk/clerk-react`) you don't need to do anything. If you are relying on `@clerk/shared`, please read through the breaking changes below and change your code accordingly. You can rely on your IDE to give you hints on which exports are available at `@clerk/shared` and `@clerk/shared/<name>` subpaths.

  **Breaking Changes**

  - `@clerk/shared` was and still is a dual CJS/ESM package. The ESM files provided by `@clerk/shared` now use `.mjs` file extensions and also define them in their import paths, following the ESM spec. Your bundler should handle this for you.
  - Some imports where moved from the root `@clerk/shared` import to isolated subpaths.

    - Helper utils for cookies and globs:

      ```diff
      - import { createCookieHandler, globs } from "@clerk/shared"
      + import { createCookieHandler } from "@clerk/shared/cookie"
      + import { globs } from "@clerk/shared/globs"
      ```

    - Everything related to React. Below is a small example and the full list of exports:

      ```diff
      - import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared"
      + import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared/react"
      ```

      Full list of exports moved to `@clerk/shared/react`:

      ```ts
      export {
        ClerkInstanceContext,
        ClientContext,
        OrganizationContext,
        OrganizationProvider,
        SessionContext,
        UserContext,
        assertContextExists,
        createContextAndHook,
        useClerkInstanceContext,
        useClientContext,
        useOrganization,
        useOrganizationContext,
        useOrganizationList,
        useOrganizations,
        useSafeLayoutEffect,
        useSessionContext,
        useUserContext,
      };
      ```

  If you run into an issues that might be a bug, please [open a bug report](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml) with a minimal reproduction.

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Improve internal test coverage and fix small bug inside `callWithRetry` ([#1925](https://github.com/clerk/javascript/pull/1925)) by [@LekoArts](https://github.com/LekoArts)

- Update imports of `@clerk/shared` to granular entrypoints. This addresses warnings during a Next.js build that are the result of unsupported APIs being included in the module graph of builds for the edge runtime. ([#1924](https://github.com/clerk/javascript/pull/1924)) by [@BRKalow](https://github.com/BRKalow)

## 0.24.5

### Patch Changes

- Add `Clerk - ` prefix to deprecation warnings ([#1890](https://github.com/clerk/javascript/pull/1890)) by [@dimkl](https://github.com/dimkl)

- Deprecate the `organization.__unstable__invitationUpdate` and `organization.__unstable__membershipUpdate` methods. ([#1879](https://github.com/clerk/javascript/pull/1879)) by [@panteliselef](https://github.com/panteliselef)

- Internal updates and improvements, with the only public change that npm should no longer complain about missing `react` peerDependency. ([#1868](https://github.com/clerk/javascript/pull/1868)) by [@LekoArts](https://github.com/LekoArts)

  Updates:

  - Remove `@clerk/shared/testUtils` export (which was only used for internal usage)
  - Add `peerDependenciesMeta` to make `react` peerDep optional

- In invite members screen of the <OrganizationProfile /> component, consume any invalid email addresses as they are returned in the API error and remove them from the input automatically. ([#1869](https://github.com/clerk/javascript/pull/1869)) by [@chanioxaris](https://github.com/chanioxaris)

## 0.24.4

### Patch Changes

- Warn about _MagicLink_ deprecations: ([#1836](https://github.com/clerk/javascript/pull/1836)) by [@dimkl](https://github.com/dimkl)

  - `MagicLinkError`
  - `isMagicLinkError`
  - `MagicLinkErrorCode`
  - `handleMagicLinkVerification`
  - `createMagicLinkFlow`
  - `useMagicLink`

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

## 0.24.3

### Patch Changes

- Make `types` the first key in all `exports` maps defined in our packages' `package.json`. The [TypeScript docs](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing) recommends so, as the the `exports` map is order-based. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Apply deprecation warnings for @clerk/types: ([#1823](https://github.com/clerk/javascript/pull/1823)) by [@dimkl](https://github.com/dimkl)

  - `orgs` jwt claims
  - `apiKey`
  - `frontendApi`
  - `redirect_url`
  - `password`
  - `generateSignature`
  - `afterSwitchOrganizationUrl`
  - `profileImageUrl`

- Revert the removal of the `clerkError` property from `ClerkAPIError` class. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Retry the implemented changes from [#1767](https://github.com/clerk/javascript/pull/1767) which were reverted in [#1806](https://github.com/clerk/javascript/pull/1806) due to RSC related errors (not all uses components had the `use client` directive). Restore the original PR and add additional `use client` directives to ensure it works correctly. by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.24.2

### Patch Changes

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

## 0.24.1

### Patch Changes

- Temporarily revert internal change to resolve RSC-related errors ([#1806](https://github.com/clerk/javascript/pull/1806)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.24.0

### Minor Changes

- Introduce `getClerkJsMajorVersionOrTag()`, `getScriptUrl()`, `callWithRetry()` ([#1769](https://github.com/clerk/javascript/pull/1769)) by [@dimkl](https://github.com/dimkl)

- Add the `use client` directive in `@clerk/shared` to make the package compatible with an RSC environment. ([#1767](https://github.com/clerk/javascript/pull/1767)) by [@dimkl](https://github.com/dimkl)

  Remove several helpers from `@clerk/nextjs` and import them from `@clerk/shared` instead.

### Patch Changes

- Apply deprecation warnings for `@clerk/shared`: ([#1789](https://github.com/clerk/javascript/pull/1789)) by [@dimkl](https://github.com/dimkl)

  - `OrganizationContext`
  - `organizationList`
  - `useOrganizations`
  - `getRequestUrl`

- Removes the patch for disabling swr-devtools causing apps with swr and broswers with the devtools extention to break. ([#1794](https://github.com/clerk/javascript/pull/1794)) by [@panteliselef](https://github.com/panteliselef)

## 0.23.1

### Patch Changes

- Introduce `invitations` in useOrganization, which enables to fetch invitations as paginated lists. ([#1766](https://github.com/clerk/javascript/pull/1766)) by [@panteliselef](https://github.com/panteliselef)

  Deprecate `invitationList` in favor of the above introduction.

- Safer usage of `localStorage` by checking if `window` is available in current environment ([#1774](https://github.com/clerk/javascript/pull/1774)) by [@LekoArts](https://github.com/LekoArts)

- Fix SyntaxError on non-module imports by dropping support for import.meta (used in vite) ([#1782](https://github.com/clerk/javascript/pull/1782)) by [@dimkl](https://github.com/dimkl)

- `deprecated()` & `deprecatedProperty` warnings will be hidden in test/production ([#1784](https://github.com/clerk/javascript/pull/1784)) by [@dimkl](https://github.com/dimkl)

  environments and when there is no NODE_ENV environment variable defined.

## 0.23.0

### Minor Changes

- Introduce `deprecated()` and `deprecatedProperty()` helper methods to report deprecation warnings once on console ([#1743](https://github.com/clerk/javascript/pull/1743)) by [@dimkl](https://github.com/dimkl)

- Introduce `isDevelopmentEnvironment()` helper method ([#1752](https://github.com/clerk/javascript/pull/1752)) by [@dimkl](https://github.com/dimkl)

## 0.22.1

### Patch Changes

- Fix: swr devtools breaks applications with clerk ([#1694](https://github.com/clerk/javascript/pull/1694)) by [@panteliselef](https://github.com/panteliselef)

  - Force disable swr devtools for organization hooks
  - Let the swr devtool to pick the correct react version

- Deprecate `membershipList` in favor of `memberships` that supports paginated responses ([#1708](https://github.com/clerk/javascript/pull/1708)) by [@panteliselef](https://github.com/panteliselef)

## 0.22.0

### Minor Changes

- Introduces userInvitations from `useOrganizationList` ([#1520](https://github.com/clerk/javascript/pull/1520)) by [@panteliselef](https://github.com/panteliselef)

  `userInvitations` is a paginated list of data. It can be used to create Paginated tables or Infinite lists.

### Patch Changes

- Introduces a new resource called OrganizationMembership ([#1572](https://github.com/clerk/javascript/pull/1572)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerk/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)

  - This is a list of users that have requested to join the active organization

- Updates signature of OrganizationMembership.retrieve to support backwards compatibility while allowing using the new paginated responses. ([#1606](https://github.com/clerk/javascript/pull/1606)) by [@panteliselef](https://github.com/panteliselef)

  - userMemberships is now also part of the returned values of useOrganizationList

- Introduces a new resource called OrganizationDomain ([#1569](https://github.com/clerk/javascript/pull/1569)) by [@panteliselef](https://github.com/panteliselef)

  - useOrganization has been updated in order to return a list of domain with the above type

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerk/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)

  - Users can request to join a suggested organization

## 0.21.0

### Minor Changes

- Handle the construction of zxcvbn errors with information from FAPI ([#1526](https://github.com/clerk/javascript/pull/1526)) by [@raptisj](https://github.com/raptisj)

## 0.20.0

### Minor Changes

- Deprecate the `useOrganizations` react hook. The hook can be replaced from useClerk, useOrganization, useOrganizationList ([#1466](https://github.com/clerk/javascript/pull/1466)) by [@panteliselef](https://github.com/panteliselef)

## 0.19.1

### Patch Changes

- Optimize all images displayed within the Clerk components, such as Avatars, static OAuth provider assets etc. All images are now resized and compressed. Additionally, all images are automatically converted into more efficient formats (`avif`, `webp`) if they are supported by the user's browser, otherwise all images fall back to `jpeg`. ([#1367](https://github.com/clerk/javascript/pull/1367)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.19.0

### Minor Changes

- Export error helpers from the shared package to the framework specific packages ([#1308](https://github.com/clerk/javascript/pull/1308)) by [@desiprisg](https://github.com/desiprisg)

### Patch Changes

- Resolve all reported ESM build issues by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 0.18.0

### Minor Changes

- ESM/CJS support for `@clerk/clerk-react` by [@nikosdouvlis](https://github.com/nikosdouvlis)

  Changes that should affect users and OS contributors:

  - Better source map support for `@clerk/clerk-react`, `@clerk/shared`. This affects anyone developing in our monorepo or anyone using a debugger with Clerk installed in their app.
  - Easier node_modules debugging as `@clerk/clerk-react`, `@clerk/shared` and `@clerk/nextjs` are no longer getting bundled as a single-file package. This also improves error logging in nextjs a lot, as nextjs usually logs the line that threw the error - a minified, single-file package, usually consists of a very long single-line module, so logging error in NextJS wasn't ideal.
  - Headless clerk-js bundle size reduced by ~10kb, normal clerk-ks by ~6kb
  - A new `clerkJSVersion` prop has been added on ClerkProvider allowing to fetch a specific clerk-js version.

## [0.17.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.17.0-staging.0...@clerk/shared@0.17.0) (2023-05-23)

**Note:** Version bump only for package @clerk/shared

### [0.16.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.2-staging.0...@clerk/shared@0.16.2) (2023-05-18)

**Note:** Version bump only for package @clerk/shared

### [0.16.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.1-staging.1...@clerk/shared@0.16.1) (2023-05-17)

**Note:** Version bump only for package @clerk/shared

## [0.16.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.16.0-staging.3...@clerk/shared@0.16.0) (2023-05-15)

**Note:** Version bump only for package @clerk/shared

### [0.15.7](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.4...@clerk/shared@0.15.7) (2023-05-04)

**Note:** Version bump only for package @clerk/shared

### [0.15.7-staging.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.3...@clerk/shared@0.15.7-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/shared

### [0.15.7-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.7-staging.2...@clerk/shared@0.15.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/shared

### [0.15.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.6-staging.0...@clerk/shared@0.15.6) (2023-04-19)

**Note:** Version bump only for package @clerk/shared

### [0.15.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.4...@clerk/shared@0.15.5) (2023-04-19)

**Note:** Version bump only for package @clerk/shared

### [0.15.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.4-staging.0...@clerk/shared@0.15.4) (2023-04-12)

**Note:** Version bump only for package @clerk/shared

### [0.15.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.3-staging.3...@clerk/shared@0.15.3) (2023-04-11)

**Note:** Version bump only for package @clerk/shared

### [0.15.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.2-staging.0...@clerk/shared@0.15.2) (2023-04-06)

**Note:** Version bump only for package @clerk/shared

### [0.15.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.1-staging.3...@clerk/shared@0.15.1) (2023-03-31)

**Note:** Version bump only for package @clerk/shared

### [0.15.1-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.1-staging.2...@clerk/shared@0.15.1-staging.3) (2023-03-31)

### Bug Fixes

- **shared:** Check if in clientSide only via window ([bef819e](https://github.com/clerk/clerk_docker/commit/bef819e7596337a96f073bb130fbc14244975d8c))

## [0.15.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.15.0-staging.0...@clerk/shared@0.15.0) (2023-03-29)

**Note:** Version bump only for package @clerk/shared

### [0.13.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.13.1-staging.2...@clerk/shared@0.13.1) (2023-03-10)

**Note:** Version bump only for package @clerk/shared

## [0.13.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.13.0-staging.0...@clerk/shared@0.13.0) (2023-03-09)

**Note:** Version bump only for package @clerk/shared

### [0.12.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.4-staging.0...@clerk/shared@0.12.4) (2023-03-07)

**Note:** Version bump only for package @clerk/shared

### [0.12.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.3-staging.1...@clerk/shared@0.12.3) (2023-03-03)

**Note:** Version bump only for package @clerk/shared

### [0.12.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.2-staging.0...@clerk/shared@0.12.2) (2023-03-01)

**Note:** Version bump only for package @clerk/shared

### [0.12.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.1-staging.0...@clerk/shared@0.12.1) (2023-02-25)

**Note:** Version bump only for package @clerk/shared

## [0.12.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.12.0-staging.0...@clerk/shared@0.12.0) (2023-02-24)

**Note:** Version bump only for package @clerk/shared

### [0.11.5-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.5-staging.1...@clerk/shared@0.11.5-staging.2) (2023-02-22)

**Note:** Version bump only for package @clerk/shared

### [0.11.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.4-staging.0...@clerk/shared@0.11.4) (2023-02-17)

**Note:** Version bump only for package @clerk/shared

### [0.11.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.3-staging.1...@clerk/shared@0.11.3) (2023-02-15)

**Note:** Version bump only for package @clerk/shared

### [0.11.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.2-staging.1...@clerk/shared@0.11.2) (2023-02-10)

**Note:** Version bump only for package @clerk/shared

### [0.11.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.1-staging.0...@clerk/shared@0.11.1) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

### [0.11.1-staging.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.0-staging.0...@clerk/shared@0.11.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

## [0.11.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.11.0-staging.0...@clerk/shared@0.11.0) (2023-02-07)

**Note:** Version bump only for package @clerk/shared

## [0.10.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.10.0-staging.2...@clerk/shared@0.10.0) (2023-02-01)

**Note:** Version bump only for package @clerk/shared

### [0.9.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.3-staging.4...@clerk/shared@0.9.3) (2023-01-27)

**Note:** Version bump only for package @clerk/shared

### [0.9.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.2-staging.0...@clerk/shared@0.9.2) (2023-01-24)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Drop support for NodeJS 12 ([d9169ab](https://github.com/clerk/clerk_docker/commit/d9169ab4873e1745d7250628f5bf8c8f7da49421))

### [0.9.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.0...@clerk/shared@0.9.1) (2023-01-20)

**Note:** Version bump only for package @clerk/shared

## [0.9.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.9.0-staging.2...@clerk/shared@0.9.0) (2023-01-17)

### Bug Fixes

- **backend,clerk-sdk-node,shared:** Support node12 runtimes ([fdcd6b3](https://github.com/clerk/clerk_docker/commit/fdcd6b3f7c61490297a5fdfa80228cbb7787b49b))
- **shared:** Replace atob with isomorphicAtob ([bfb1825](https://github.com/clerk/clerk_docker/commit/bfb1825e78cdf9970425dc79f3f9610e8a2699f7))

### [0.8.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.3-staging.1...@clerk/shared@0.8.3) (2022-12-19)

**Note:** Version bump only for package @clerk/shared

### [0.8.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.2-staging.0...@clerk/shared@0.8.2) (2022-12-13)

**Note:** Version bump only for package @clerk/shared

### [0.8.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.0...@clerk/shared@0.8.1) (2022-12-12)

**Note:** Version bump only for package @clerk/shared

## [0.8.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.8.0-staging.1...@clerk/shared@0.8.0) (2022-12-09)

**Note:** Version bump only for package @clerk/shared

### [0.7.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.1...@clerk/shared@0.7.2) (2022-12-08)

**Note:** Version bump only for package @clerk/shared

### [0.7.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.1-staging.0...@clerk/shared@0.7.1) (2022-12-08)

**Note:** Version bump only for package @clerk/shared

## [0.7.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.7.0-staging.0...@clerk/shared@0.7.0) (2022-12-02)

**Note:** Version bump only for package @clerk/shared

## [0.6.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.6.0-staging.5...@clerk/shared@0.6.0) (2022-11-30)

**Note:** Version bump only for package @clerk/shared

## [0.6.0-staging.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.6.0-staging.4...@clerk/shared@0.6.0-staging.5) (2022-11-29)

**Note:** Version bump only for package @clerk/shared

### [0.5.7](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.7-staging.0...@clerk/shared@0.5.7) (2022-11-25)

**Note:** Version bump only for package @clerk/shared

### [0.5.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.6-staging.0...@clerk/shared@0.5.6) (2022-11-25)

**Note:** Version bump only for package @clerk/shared

### [0.5.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4...@clerk/shared@0.5.5) (2022-11-23)

**Note:** Version bump only for package @clerk/shared

### [0.5.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.3...@clerk/shared@0.5.4) (2022-11-22)

**Note:** Version bump only for package @clerk/shared

### [0.5.4-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.2...@clerk/shared@0.5.4-staging.3) (2022-11-21)

**Note:** Version bump only for package @clerk/shared

### [0.5.4-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.4-staging.1...@clerk/shared@0.5.4-staging.2) (2022-11-21)

### Bug Fixes

- **shared:** Add optional locale param to `formatRelative` ([0582eb7](https://github.com/clerk/clerk_docker/commit/0582eb78de7c1807e1709d038cfda13cb6db589d))
- **shared:** Fix failing tests ([08bff82](https://github.com/clerk/clerk_docker/commit/08bff821466986d9698fd209eca2ae0872fe9147))

### [0.5.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.3-staging.1...@clerk/shared@0.5.3) (2022-11-18)

**Note:** Version bump only for package @clerk/shared

### [0.5.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.2-staging.3...@clerk/shared@0.5.2) (2022-11-15)

**Note:** Version bump only for package @clerk/shared

### [0.5.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.5.1-staging.1...@clerk/shared@0.5.1) (2022-11-10)

**Note:** Version bump only for package @clerk/shared

## [0.5.0](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.3-staging.2...@clerk/shared@0.5.0) (2022-11-05)

### Features

- **clerk-js,shared:** Introduce private unstable\_\_mutate to force mutate swr state ([2a21dd8](https://github.com/clerk/clerk_docker/commit/2a21dd8ea3935f3889044c063fe7af4bfc03cbfd))

### [0.4.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.7...@clerk/shared@0.4.2) (2022-11-03)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.3...@clerk/shared@0.4.2-staging.4) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.3](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.1...@clerk/shared@0.4.2-staging.3) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.2-staging.1...@clerk/shared@0.4.2-staging.2) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.2-staging.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.4.1...@clerk/shared@0.4.2-staging.1) (2022-11-02)

**Note:** Version bump only for package @clerk/shared

### [0.4.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.4.1) (2022-10-24)

**Note:** Version bump only for package @clerk/shared

### [0.0.6](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.0.6) (2022-10-24)

**Note:** Version bump only for package @clerk/shared

### [0.0.5](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.4...@clerk/shared@0.0.5) (2022-10-14)

**Note:** Version bump only for package @clerk/shared

### [0.0.4](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.2-staging.2...@clerk/shared@0.0.4) (2022-10-14)

### Bug Fixes

- **shared:** Version bump for shared ([c0cebb5](https://github.com/clerk/clerk_docker/commit/c0cebb50bc94fa44e37b96c5a645a8b18ba37df8))

### [0.0.2](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.0.2-staging.2...@clerk/shared@0.0.2) (2022-10-14)

**Note:** Version bump only for package @clerk/shared

### [0.0.2-staging.1](https://github.com/clerk/clerk_docker/compare/@clerk/shared@0.3.27...@clerk/shared@0.0.2-staging.1) (2022-10-13)

**Note:** Version bump only for package @clerk/shared
