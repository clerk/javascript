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
- [] Custom claim validation
- [] [Key sizes](https://clerkinc.slack.com/archives/C04372Z64V6/p1666428277862049?thread_ts=1666214091.100049&cid=C04372Z64V6)
- [] Add tribute to https://github.com/cfworker/cfworker/tree/main/packages/jwt
- [] Replace mock with a fetcher using dependency injection
