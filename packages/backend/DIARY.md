## Goals

- [x] Write it for V8 isolate runtime first.
- [x] Isomorphic fetch & crypto.
- [x] Do not raise an error if CLERK_API_KEY is not set during module import.
- [x] Support multiple CLERK_API_KEY for multiple instance REST access.
- [x] Align JWT key resolution algorithm across all environments (Function param > Env > JWKS from API).
- [x] Remove auth0-jwks library that is node specific.
- [x] Fetch JWKS from JWT issuer not from BAPI.
- [x] Build a test suite across different runtimes (Node, CF Workers, Vercel Edge middleware.)
- [x] Clean up interstitial logic.
- [x] Refactor the Rest Client API to return `{data, errors}` instead of throwing errors.
- [x] Move interstitial fetching into @clerk/backend.
- [x] Supports Node >= 16 due to native web crypto requirement.
- [x] Do not use any process.env as it's not supported across all run-times.
- [x] Export a generic verifyToken for all Clerk JWTs verification.
- x] Align Auth data interface and move getToken builder in one place by passing an API client to getAuthState

## Remaining tasks

- [] Polish API key, url, and version injection
- [] Export CJS and ESM without [dual package hazard](https://github.com/nodejs/modules/issues/409)
- [] Build test coverage
- [] Run suite in Deno runtime

## Nice to haves

- [] Custom claim validation in verifyToken for JWT templates
- [] Replace QUnit with Mocha in a browser-like setup using ESM.
- [] Replace Sinon with https://mswjs.io
- [] Add tribute to https://github.com/cfworker/cfworker/tree/main/packages/jwt
- [] Make test suite files load dynamically so that we don't need to manually update `suites.ts` every time we add a new test file.
- [] Dynamic resource parsing to remove the deserializer
