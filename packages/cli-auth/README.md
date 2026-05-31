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

`@clerk/cli-auth` is a set of building blocks for adding [Clerk](https://clerk.com) authentication to Node.js command-line tools. It handles browser-based OAuth sign-in, token storage, refresh, revocation, and credential resolution for API keys and OAuth access tokens.

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

Pick whichever path fits your workflow.

**Clerk Dashboard** — in your dev instance, go to **Configure → OAuth Applications → Create** and set:

- **Name** — your CLI's name
- **Redirect URI** — `http://127.0.0.1/callback` (the CLI listens on a dynamic loopback port and sends the actual `http://127.0.0.1:{port}/callback` during authorization)
- **Public client (PKCE)** — enabled
- **Scopes** — `profile email openid offline_access`

**Clerk CLI** — if you have [`clerk`](https://clerk.com/cli) installed, this is the fastest path. Keychain-based auth, no secret key in the env:

```sh
clerk api /oauth_applications --instance <ins_...> -X POST --yes -d '{
  "name": "my-cli",
  "redirect_uris": ["http://127.0.0.1/callback"],
  "public": true,
  "pkce_required": true,
  "scopes": "profile email openid offline_access"
}'
```

**curl against BAPI** — if you'd rather script it directly. Replace `$SK` with your instance's secret key:

```sh
curl -X POST https://api.clerk.com/v1/oauth_applications \
  -H "Authorization: Bearer $SK" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-cli",
    "redirect_uris": ["http://127.0.0.1/callback"],
    "public": true,
    "pkce_required": true,
    "scopes": "profile email openid offline_access"
  }'
```

All three paths return a JSON object with `client_id`. Pair it with your instance's Frontend API URL (the issuer — e.g. `https://clerk.your-subdomain.accounts.dev` or a custom domain like `https://clerk.yourapp.com`).

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

### Accept API keys alongside OAuth

CLIs that run in CI/CD, agents, or scripted environments often need to authenticate with a Clerk API key (`ak_*`) instead of going through the browser. API keys can represent a user, an organization, or a machine identity — one credential type covers all three. Configure `identityEndpoint` (and optionally `tokenEnvVar`) to enable this:

```ts
const auth = new ClerkCliAuth({
  clientId: process.env.CLERK_OAUTH_CLIENT_ID!,
  issuer: process.env.CLERK_ISSUER!,
  identityEndpoint: 'https://myapp.com/api/cli/identity',
  tokenEnvVar: 'MYAPP_API_KEY',
});

// Look up the identity for a specific token (API key or OAuth access token):
const identity = await auth.verifyToken(process.env.MYAPP_API_KEY!);

// Or let the SDK pick whichever credential is available:
const { token, source } = await auth.resolveToken({ tokenFromArg: argv.token });
```

`resolveToken()` checks for a credential in this order:

1. The `tokenFromArg` you pass in (typically from a `--token` CLI flag) → `source: 'arg'`.
2. The environment variable named in `tokenEnvVar` → `source: 'env'`.
3. The cached OAuth access token from `login()` → `source: 'oauth'`.

`source` tells you where the credential came from — refreshable OAuth vs. a static value the user supplied — so you can branch on the trust model without introspecting the bearer's shape:

```ts
const { token, source } = await auth.resolveToken({ tokenFromArg: argv.token });

// One call works for every source — the server-side handler verifies and returns the
// identity:
const identity = await auth.verifyToken(token);

if (source === 'oauth') {
  // ...e.g. surface "logged in as <user>" UI; this credential is revokable via logout()
}
```

### Backend verification

`auth.verifyToken(token)` posts the bearer to your `identityEndpoint` and expects a JSON `Identity` response. The endpoint is responsible for verifying the token server-side (where your Clerk secret key lives) and returning the resolved subject.

A drop-in route handler that wraps `@clerk/backend`'s verification is shipping as a follow-up. Until then, host your own — verify API keys with `clerk.apiKeys.verify(token)` and OAuth tokens with `clerk.authenticateRequest(request, { acceptsToken: ['oauth_token'] })`, then respond with an `Identity` shape (`{ sub, ... }`).

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
