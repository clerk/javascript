# OAuth scope authorization with Hono

This example runs two local programs:

- a Hono resource server protected by Clerk's `clerkMiddleware()`;
- a PKCE OAuth client that opens Clerk's authorization page, receives the code on a loopback callback, exchanges it for an access token, and calls the protected route.

The protected route accepts only `oauth_token` and authorizes with:

```ts
auth.has({ oauth_scope: process.env.OAUTH_REQUIRED_SCOPE || 'profile' });
```

## Configure the example app

1. Create an OAuth application. Configure its redirect URI as `http://127.0.0.1:8788/callback` and allow at least `profile`.
1. Copy this instance's publishable key, secret key, and the OAuth application's client ID and client secret.
1. Copy the OAuth application's **Authorize URL** and **Token URL**.

Then install and configure the example:

```sh
# From the javascript repository root, install the SDK build dependencies first.
pnpm install --frozen-lockfile

cd examples/oauth-scope-hono
cp .env.example .env
pnpm install --frozen-lockfile
```

Fill in at least:

```dotenv
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OAUTH_CLIENT_ID=client_...
OAUTH_CLIENT_SECRET=...
OAUTH_AUTHORIZE_URL=https://.../oauth/authorize
OAUTH_TOKEN_URL=https://.../oauth/token
```

The example defaults `OAUTH_EXPECT_JWT_ACCESS_TOKEN=true`. New local instances default `oauth_jwt_access_tokens` to enabled; confirm that setting at `GET /v1/instance/oauth_application_settings` if the client reports an opaque token. Set the expectation to `false` only when intentionally testing opaque access tokens.

For a public client, leave `OAUTH_CLIENT_SECRET` blank and set `OAUTH_CLIENT_AUTH_METHOD=none`. PKCE is used in every mode. Confidential Clerk OAuth applications normally use `client_secret_post`.

Instead of direct endpoint URLs, you can leave `OAUTH_AUTHORIZE_URL` and `OAUTH_TOKEN_URL` blank and set `OAUTH_ISSUER_URL`. The client will use RFC 8414 authorization-server discovery. Set `OAUTH_DISCOVERY_URL` when the stack exposes metadata at a compatibility or proxy-specific URL.

## Run

Build the changed local SDK packages once:

```sh
pnpm run sdk:build
```

Start the resource server:

```sh
pnpm run server
```

In another terminal, run the OAuth client:

```sh
pnpm run client
```

The client prints the authorization URL and opens it in the default browser. Sign in and approve consent. A successful run ends with a `200` response showing the granted scopes and subject.

Useful client flags:

```sh
pnpm client -- --no-open
pnpm client -- --print-token
```

`--no-open` only prints the URL. `--print-token` prints the access token and should only be used for local debugging.

## Verify denial

- Set `OAUTH_REQUIRED_SCOPE` to a scope not present in `OAUTH_SCOPE`, restart the server, and run the client again. Expect `403`.
- Remove the bearer token or send a non-OAuth token to `RESOURCE_SERVER_URL`. Expect `401`.
- Scope matching is exact and case-sensitive.

## Contributing

After SDK changes, rerun `pnpm sdk:build`. Validate the example itself with `pnpm typecheck`.

In case local hostnames aren't resolving:

```sh
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```
