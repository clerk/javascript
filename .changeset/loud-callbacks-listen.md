---
'@clerk/cli-auth': minor
---

Add `@clerk/cli-auth`: reusable OAuth 2.0 + PKCE localhost-callback flow for adding Clerk authentication to Node.js CLIs.

The default export (`@clerk/cli-auth`) ships the CLI-side runtime: browser-based sign-in via a one-shot localhost callback server, token storage (keychain with file fallback, file, or memory), token refresh, revocation, `/oauth/userinfo` lookup, multi-token resolution via `resolveToken()`, optional Clerk API key verification, and tunable timeouts (`loginTimeoutMs`, `requestTimeoutMs`).

The new `@clerk/cli-auth/server` subpath ships a backend route handler factory consumers drop into any framework using Web `Request`/`Response` (Next.js App Router, Hono, Cloudflare Workers, Bun, Deno):

```ts
// lib/clerk-cli.ts
import { cliAuth } from '@clerk/cli-auth/server';
import { clerkClient } from '@clerk/nextjs/server';

export const { handle, verifyToken, verifyTokenFromRequest, resolveAuthInfo } =
  cliAuth({ client: await clerkClient() });

// app/api/cli/verify/route.ts
export const GET = handle({ accepts: ['api_key', 'oauth_token'] });
```

`cliAuth({ client | clientConfig })` binds a `@clerk/backend` client once and returns `handle()`, `verifyToken()`, `verifyTokenFromRequest()`, and `resolveAuthInfo()` ready to use. `handle({ accepts, verifyToken?, resolveAuthInfo? })` produces a route handler that detects token type by prefix, gates against `accepts`, verifies via `@clerk/backend`, and returns a `UserInfo` JSON payload. Override the verification or resolution steps per-route by passing the corresponding callbacks.
