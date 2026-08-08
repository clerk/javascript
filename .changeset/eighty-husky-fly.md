---
'@clerk/testing': minor
---

`setupClerkTestingToken` for Playwright now accepts `options.testingToken`, either as a string or as a function resolving one lazily, taking precedence over the `CLERK_TESTING_TOKEN` environment variable; the `clerk.signIn` helper accepts the same options via `setupClerkTestingTokenOptions`. It can also be called multiple times on the same browser context with different `frontendApiUrl` values, registering one bot-protection bypass per Clerk instance, so test suites spanning multiple instances no longer depend on a single process-wide `CLERK_FAPI`/`CLERK_TESTING_TOKEN` pair. The unstable `createPageObjects` and `createAppPageObject` helpers accept a new `testingTokenOptions` parameter forwarded to their automatic `setupClerkTestingToken` calls, and the Cypress `setupClerkTestingToken` accepts `options.testingToken` as a string.

Note: `setupClerkTestingToken` for Playwright now resolves the frontend API URL before its duplicate-call check, so calling it without a resolvable frontend API URL (no `options.frontendApiUrl` and no `CLERK_FAPI`) always throws; previously such repeat calls on an already-set-up context were silently ignored.
