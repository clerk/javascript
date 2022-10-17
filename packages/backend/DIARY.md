## Goals

- [x] Write it for V8 isolates, not node
- [x] Isomorphic fetch & crypto
- [x] Do not raise an error if CLERK_API_KEY is not set during module import
- [x] Support multiple CLERK_API_KEY for multiple instance REST access
- [x] JWT jey resolution is the same across all environments (Function param > Env > JWKS from API)
- [] Almost zero dependencies (we will only keep isomoprhic fetch)
- [x] Remove auth0-jwks library that is note specific
- [x] Fetch JWKS from JWT issuer not from BAPI

## Remaining tasks

- [] Add unit tests
- [] Clean up interstitial logic
- [] Export CJS and ESM without [dual package hazard](https://github.com/nodejs/modules/issues/409)
- [] Add integration tests across different runtimes (Node, CF Workers, Vercel Edge middleware, etc...)
- [] Add easier debugging
