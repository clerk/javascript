---
'@clerk/cli-auth': minor
---

Add `@clerk/cli-auth`: reusable OAuth 2.0 + PKCE localhost-callback flow for adding Clerk authentication to Node.js CLIs.

The default export (`@clerk/cli-auth`) ships the CLI-side runtime: browser-based sign-in via a one-shot localhost callback server, token storage (keychain with file fallback, file, or memory), token refresh, revocation, `/oauth/userinfo` lookup, multi-credential resolution via `resolveToken()` (returns `{ token, source }` where `source` is `'arg' | 'env' | 'oauth'`), optional `identityEndpoint`-backed verification, and tunable timeouts (`loginTimeoutMs`, `requestTimeoutMs`).

The new `@clerk/cli-auth/server` subpath ships a backend route handler that consumers drop into any framework using Web `Request`/`Response` (Next.js App Router, Hono, Cloudflare Workers, Bun, Deno):

```ts
// lib/clerk-cli.ts
import { cliAuth } from '@clerk/cli-auth/server';
import { clerkClient } from '@clerk/nextjs/server';

export const auth = cliAuth({ client: clerkClient });

// app/api/cli/identity/route.ts
import { handle } from '@clerk/cli-auth/server';
import { auth } from '@/lib/clerk-cli';

export const GET = handle({ auth, accepts: ['api_key', 'oauth_token'] });
```

`cliAuth({ client | clientConfig })` binds a `@clerk/backend` client once and returns an instance exposing `verifyToken(token)`, `verifyTokenFromRequest(request)`, `resolveAuthInfo(ctx)`, and `getClerk()`. The standalone `handle({ auth, accepts, verifyToken?, resolveAuthInfo? })` produces a route handler that auto-detects token type, gates against `accepts`, verifies via `@clerk/backend`'s `verifyMachineAuthToken`, and returns an `Identity` JSON payload. Override the verification or resolution steps per-route by passing the corresponding callbacks.

`accepts` recognizes `'api_key'` (covers user, org, and machine subjects), `'oauth_token'` (opaque `oat_*` or RFC 9068 `at+jwt` JWTs), or `'any'`. The narrowed `TokenKind` excludes Clerk session tokens and M2M tokens — neither is a CLI credential.
