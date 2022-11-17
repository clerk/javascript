## Goals

- [x] Build for V8 isolates first.
- [x] Make it isomorphic to work across all modern JS runtimes.
- [x] Use options injection for all keys and settings.
- [x] Support multiple CLERK_API_KEY for multiple instance REST access.
- [x] Align JWT key resolution algorithm across all environments (Function param > Environment variable > JWKS from API).
- [x] Tested automatically across different runtimes (Node, CF Workers, Vercel Edge middleware.)
- [x] Clean up Clerk interstitial logic.
- [x] Refactor the Rest Client API to return `{data, errors}` instead of throwing errors.
- [x] Export a generic verifyToken for Clerk JWTs verification.
- [x] Align AuthData interface for SSR.
- [x] Export CJS and ESM.

## Remaining tasks

- [] Build test coverage
- [] Run suite in Deno runtime
- [] Custom claim validation in verifyToken for JWT templates
- [] Replace QUnit with Mocha in a browser-like setup using ESM.
- [] Replace Sinon with https://mswjs.io
- [] Add tribute to https://github.com/cfworker/cfworker/tree/main/packages/jwt
- [] Make test suite files load dynamically so that we don't need to manually update `suites.ts` every time we add a new test file.
- [] Dynamic resource parsing to remove the deserializer
