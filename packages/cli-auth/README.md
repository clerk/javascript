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
[![Follow on Twitter](https://img.shields.io/twitter/follow/Clerk?style=social)](https://twitter.com/intent/follow?screen_name=Clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/cli-auth/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_cli_auth)

</div>

## Getting Started

`@clerk/cli-auth` implements the OAuth 2.0 Authorization Code + PKCE localhost-callback flow for adding [Clerk](https://clerk.com) authentication to Node.js command-line tools.

### Prerequisites

- Node.js `>=20.9.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_cli_auth).
- An OAuth Application registered with your Clerk instance (see [Setup](#setup) below)

### Installation

```sh
npm install @clerk/cli-auth
```

## Setup

You need two things: an **OAuth Application** registered with a Clerk instance, and the `client_id` + issuer URL from it.

### 1. Create an OAuth Application

Pick whichever path fits your workflow.

**Clerk Dashboard (recommended for most devs)** — in your dev instance, go to **Configure → OAuth Applications → Create**. Set:

- Name: your CLI's name
- Redirect URI: `http://127.0.0.1/callback` (the CLI listens on a dynamic loopback port and sends the actual `http://127.0.0.1:{port}/callback` redirect URI during authorization)
- Public client (PKCE): enabled
- Scopes: `profile email openid offline_access`

**curl against BAPI** — if you prefer scripting. Replace `$SK` with your instance's secret key:

```bash
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

All paths return a JSON object with `client_id`. Grab it along with your instance's Frontend API URL (the issuer, e.g. `https://clerk.your-subdomain.accounts.dev` or a custom domain like `https://clerk.yourapp.com`).

### 2. Configure your CLI

```bash
export CLERK_OAUTH_CLIENT_ID="..."   # from step 1
export CLERK_ISSUER="https://clerk.your-subdomain.accounts.dev"
```

## Usage

```ts
import { ClerkCliAuth } from '@clerk/cli-auth';

const auth = new ClerkCliAuth({
  clientId: process.env.CLERK_OAUTH_CLIENT_ID!,
  issuer: process.env.CLERK_ISSUER!,
  scopes: ['profile', 'email', 'openid', 'offline_access'],
  storage: 'keychain',
  keychainService: 'my-cli',
});

// Opens a browser, starts a one-shot localhost listener, exchanges the code,
// stores tokens in the OS keychain. Returns the token set and userinfo.
const { tokens, user } = await auth.login();

// Returns the cached access token; auto-refreshes when within 30s of expiry.
const token = await auth.getAccessToken();

// Reads the cached user. If no cache, fetches from /oauth/userinfo.
const me = await auth.whoami();

// Revokes the refresh token at the issuer, then clears keychain + cached userinfo.
// Pass { revoke: false } to skip the network call (e.g. offline or token already expired).
await auth.logout();
```

## How the flow works

```
1. CLI generates PKCE (code_verifier, code_challenge=S256(verifier)) + CSRF state.
2. CLI binds a one-shot HTTP server on 127.0.0.1:0 (random port).
3. CLI opens browser to:
     {issuer}/oauth/authorize?client_id=...&code_challenge=...
       &redirect_uri=http://127.0.0.1:{port}/callback&state=...
       &code_challenge_method=S256
4. User signs in via Clerk's hosted UI and approves consent.
5. Clerk redirects the browser to http://127.0.0.1:{port}/callback?code=...&state=...
6. Server validates state, responds with "You can close this tab", closes.
7. CLI posts to {issuer}/oauth/token with grant_type=authorization_code + code_verifier.
8. CLI stores the token set in the OS keychain (falls back to chmod 600 JSON file).
```

## Known limitations

- **Keychain path is tested structurally, not in CI.** Keychain access triggers OS credential-manager prompts in headless environments, so automated tests use memory and file stores. The keychain path is exercised end-to-end when consumers run against a real Clerk instance.
- **Device Authorization Grant (RFC 8628) is not implemented.** The localhost-callback flow needs an open port, which doesn't work for CI, containers, or SSH sessions. If you need that, [open an issue](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=feature_request.yml).

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_cli_auth)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/cli-auth` follows good practices of security, but 100% security cannot be assured.

`@clerk/cli-auth` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/cli-auth/LICENSE) for more information.
