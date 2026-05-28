<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_cli_auth" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/cli-auth</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_cli_auth)
[![Follow on Twitter](https://img.shields.io/twitter/follow/Clerk?style=social)](https://x.com/intent/follow?screen_name=Clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/cli-auth/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_cli_auth)

</div>

## Getting Started

`@clerk/cli-auth` is a set of building blocks for adding [Clerk](https://clerk.com) authentication to Node.js command-line tools.

The package ships two entry points:

- **`@clerk/cli-auth`** — sign-in and credential management in your CLI.
- **`@clerk/cli-auth/server`** — verify CLI requests on your backend.

### Prerequisites

- Node.js `>=20.9.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_cli_auth).

### Installation

```sh
npm install @clerk/cli-auth
```

## Setup

Create an OAuth Application in your Clerk instance and grab its `client_id` and issuer URL.

### Create an OAuth Application

In the [Clerk Dashboard](https://dashboard.clerk.com), go to **Configure → OAuth Applications → Create** and set:

- **Name** — your CLI's name
- **Redirect URI** — `http://127.0.0.1/callback`
- **Public client (PKCE)** — enabled
- **Scopes** — `profile email openid offline_access`

The dashboard returns a `client_id`. Pair it with your instance's Frontend API URL (e.g. `https://clerk.your-subdomain.accounts.dev` or your custom domain).

If you prefer scripting, the same can be done with a `POST` to `https://api.clerk.com/v1/oauth_applications` — see the [Clerk Backend API reference](https://clerk.com/docs/reference/backend-api).

### Configure your CLI

```sh
export CLERK_OAUTH_CLIENT_ID="..."
export CLERK_ISSUER="https://clerk.your-subdomain.accounts.dev"
```

## Usage

### Sign in

```ts
import { ClerkCliAuth } from '@clerk/cli-auth';

const auth = new ClerkCliAuth({
  clientId: process.env.CLERK_OAUTH_CLIENT_ID!,
  issuer: process.env.CLERK_ISSUER!,
  scopes: ['profile', 'email', 'openid', 'offline_access'],
  storage: 'keychain',
  keychainService: 'my-cli',
});

const { tokens, user } = await auth.login();
console.log(`Signed in as ${user.email}`);
```

`login()` opens the user's browser, starts a one-shot localhost server, exchanges the authorization code for tokens, and stores the result in the OS keychain (with a `chmod 0600` file fallback). Pass `storage: 'memory'` for ephemeral sessions or `storage: 'file'` to skip the keychain entirely.

### Get the current user

```ts
const me = await auth.whoami();
if (me) {
  console.log(`${me.name} <${me.email}>`);
}
```

`whoami()` returns the live user info from Clerk. It auto-refreshes the access token when it's close to expiring and surfaces revocations immediately — there is no client-side cache.

### Get an access token for API calls

```ts
const token = await auth.getAccessToken();

const res = await fetch('https://api.example.com/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

`getAccessToken()` returns the cached access token, refreshing it within 30 seconds of expiry. Returns `null` if the user isn't signed in.

### Sign out

`logout()` revokes the refresh token at Clerk's issuer, then clears the stored credentials. Pass `{ revoke: false }` to skip the network call when you're offline or the token is already expired — local credentials are cleared either way.

```ts
await auth.logout();
await auth.logout({ revoke: false });
```

### Accept API keys and machine tokens alongside OAuth

CLIs that run in CI/CD, agents, or scripted environments often need to authenticate with a Clerk API key (`ak_*`) or machine-to-machine token (`mt_*`) instead of going through the browser. Configure `identityEndpoint` (and optionally `tokenEnvVar`) to enable this:

```ts
const auth = new ClerkCliAuth({
  clientId: process.env.CLERK_OAUTH_CLIENT_ID!,
  issuer: process.env.CLERK_ISSUER!,
  identityEndpoint: 'https://myapp.com/api/cli/identity',
  tokenEnvVar: 'MYAPP_API_KEY',
});

// Look up the identity for a specific token (API key, machine token, or OAuth access token):
const identity = await auth.verifyToken(process.env.MYAPP_API_KEY!);

// Or let the SDK pick whichever credential is available:
const { token, kind } = await auth.resolveToken({ tokenFromArg: argv.token });
```

`resolveToken()` checks for a credential in this order:

1. The `tokenFromArg` you pass in (typically from a `--token` CLI flag).
2. The environment variable named in `tokenEnvVar`.
3. The cached OAuth access token from `login()`.

It returns `{ token, kind }`, where `kind` is one of `'session_token'`, `'api_key'`, `'m2m_token'`, or `'oauth_token'` (matching the Clerk Backend SDK's `TokenType`). Use it to branch logic per credential type:

```ts
const { token, kind } = await auth.resolveToken({ tokenFromArg: argv.token });

// One call works for every kind — the server-side handler resolves the identity via the
// matching verification path:
const identity = await auth.verifyToken(token);

if (kind === 'm2m_token') {
  // ...e.g. attach the machine actor's org context to a log line
}
```

Server-side verification of API keys and machine tokens happens at the `identityEndpoint` you host — see [Server-side](#server-side) for the implementation.

## Server-side

The `@clerk/cli-auth/server` entry point provides route handlers that verify incoming tokens against Clerk and return user info. It accepts every [Clerk Backend SDK](https://clerk.com/docs/references/backend/overview) token type:

| `accepts` value   | Matching token format            |
| ----------------- | -------------------------------- |
| `'session_token'` | Clerk session JWTs               |
| `'api_key'`       | `ak_*` Clerk API keys            |
| `'m2m_token'`     | `mt_*` machine-to-machine tokens |
| `'oauth_token'`   | `oat_*` OAuth access tokens      |
| `'any'`           | Any of the above                 |

### Bind a Clerk client

Create a single `cliAuth` instance for your application:

```ts
// lib/clerk-cli.ts
import { cliAuth } from '@clerk/cli-auth/server';
import { clerkClient } from '@clerk/nextjs/server';

export const { handle, verifyToken, verifyTokenFromRequest } = cliAuth({
  client: clerkClient,
});
```

`client` accepts either a resolved Clerk Backend SDK client or a factory function. Passing `clerkClient` from `@clerk/nextjs/server` directly works — the SDK calls it lazily on the first request and caches the result. You can also pass `clientConfig` (the same options `createClerkClient` accepts) to construct a client from a specific secret key. If neither is provided, the SDK builds one from `CLERK_SECRET_KEY`.

### Identity endpoint

Set `identityEndpoint` in your `ClerkCliAuth` constructor config to a backend route that returns the verified `Identity` for a token:

```ts
// app/api/cli/identity/route.ts
import { handle } from '@/lib/clerk-cli';

export const GET = handle({
  accepts: ['api_key', 'm2m_token', 'oauth_token'],
});
```

The handler reads `Authorization: Bearer <token>`, detects the token type, verifies it with Clerk, and returns a JSON `Identity` payload. This is what `auth.verifyToken()` calls from the CLI — once it's wired, `verifyToken()` works for API keys, machine tokens, and OAuth access tokens alike.

### Protected resource endpoints

Use `verifyTokenFromRequest` to add authentication to any other route your CLI calls:

```ts
// app/api/cli/projects/route.ts
import { NextResponse } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/clerk-cli';

export async function GET(request: Request) {
  const tokenInfo = await verifyTokenFromRequest(request, {
    accepts: ['api_key', 'm2m_token', 'oauth_token'],
  });

  const projects = await getProjectsForSubject(tokenInfo.subject);
  return NextResponse.json({ projects });
}
```

`verifyTokenFromRequest` throws on missing, invalid, or unaccepted tokens. The returned `tokenInfo` includes `subject`, `type`, optional `scopes`, and the verified `claims` payload — use any of these to authorize the request.

### Customize verification and response

Override `verifyToken` or `resolveAuthInfo` on `handle()` when the defaults aren't enough. Both callbacks receive `clerk` (the bound Clerk Backend SDK client) so you don't need to re-import or re-initialize it.

Add an allowlist or alternate verifier:

```ts
export const GET = handle({
  accepts: 'api_key',
  verifyToken: async ({ token, type, request, clerk }) => {
    if (!isAllowlisted(token)) {
      throw new Error('Token not allowlisted');
    }
    const apiKey = await clerk.apiKeys.verify({ secret: token });
    return { subject: apiKey.subject, type, scopes: apiKey.scopes };
  },
});
```

Enrich the response with profile and org data:

```ts
export const GET = handle({
  accepts: ['api_key', 'oauth_token'],
  resolveAuthInfo: async ({ tokenInfo, clerk }) => {
    if (tokenInfo.type === 'oauth_token') {
      const user = await clerk.users.getUser(tokenInfo.subject);
      return {
        sub: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        picture: user.imageUrl,
      };
    }
    return {
      sub: tokenInfo.subject,
      scopes: tokenInfo.scopes,
      org_id: tokenInfo.claims?.org_id as string | undefined,
    };
  },
});
```

`handle()` also accepts `client` and `clientConfig` to override the factory's Clerk client on a per-route basis — useful for multi-tenant applications.

## Configuration reference

### Storage

`storage` controls how tokens are persisted between CLI invocations:

- `'keychain'` (default) — OS credential manager (macOS Keychain, Windows Credential Manager, libsecret on Linux). Falls back to a `chmod 0600` JSON file at `~/.config/clerk-cli-auth/<environment>.json` if the keychain is unavailable.
- `'file'` — file storage only, no keychain attempt.
- `'memory'` — in-process only. Tokens are lost when the CLI exits.

Pass a custom `keychainService` to namespace the keychain entries for your CLI, and `environment` to keep credentials for different Clerk instances separate (e.g. `'production'` vs `'staging'`).

### Timeouts

| Option             | Default            | Scope                                                                                                            |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `loginTimeoutMs`   | 120000 (2 minutes) | How long `login()` waits for the user to complete browser sign-in.                                               |
| `requestTimeoutMs` | 30000 (30 seconds) | Per-request timeout for token exchange, refresh, revocation, `/oauth/userinfo`, and `identityEndpoint` requests. |

Both fire `ClerkCliAuthError('timeout', ...)` when exceeded.

## How the OAuth flow works

```
1. The CLI generates a PKCE code verifier, a SHA-256 code challenge, and a CSRF state value.
2. The CLI binds an HTTP server on 127.0.0.1 at a random port.
3. The CLI opens the user's browser to:
     {issuer}/oauth/authorize?client_id=...&code_challenge=...
       &redirect_uri=http://127.0.0.1:{port}/callback
       &code_challenge_method=S256&state=...
4. The user signs in through Clerk's hosted UI and grants consent.
5. Clerk redirects the browser to the localhost server with `code` and `state`.
6. The server validates `state`, responds with a "you can close this tab" page, and shuts down.
7. The CLI exchanges the code for tokens at {issuer}/oauth/token with the PKCE verifier.
8. The CLI stores the tokens in the configured credential store.
```

## Support

For help with `@clerk/cli-auth`, visit [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_cli_auth) or email [support@clerk.com](mailto:support@clerk.com).

## Community

Join the [Clerk community on Discord](https://clerk.com/discord) to chat with other developers and the Clerk team.

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/cli-auth` follows good practices of security, but 100% security cannot be assured.

`@clerk/cli-auth` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/cli-auth/LICENSE) for more information.
