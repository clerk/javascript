<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_mcp_tools" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/mcp-tools

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_mcp_tools)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/mcp-tools/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_mcp_tools)

</div>

## Getting Started

`@clerk/mcp-tools` turns an MCP server built on the [MCP TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk) into an OAuth 2.0 resource server protected by Clerk:

- The `401` challenge with the `WWW-Authenticate` scope list and `resource_metadata` pointer
- Token verification through `@clerk/backend`, with every token bound to your server
- A per-tool scope map, the `403 insufficient_scope` step-up challenge, and a call-time guard
- RFC 9728 protected resource metadata
- RFC 8693 token exchange for calling downstream APIs
- A telemetry sink

### Prerequisites

- `@modelcontextprotocol/server` 2.x
- Node.js `>=20.9.0`, or any runtime with `fetch` and `Request`, such as Cloudflare Workers
- **Generate access tokens as JWTs** enabled for your Clerk instance, under **OAuth applications** then **Settings**. See [Troubleshooting](#troubleshooting).

### Installation

```sh
npm install @clerk/mcp-tools @modelcontextprotocol/server
```

### Configuration

Set your Clerk keys as environment variables, or pass them to `createClerkMcpAuth()`:

```sh
CLERK_PUBLISHABLE_KEY=pk_****
CLERK_SECRET_KEY=sk_****
```

Keys are read on the first request that needs them, so a build step or a test can import your server without them. A missing key fails that request with a `ClerkMcpError` that names it. Invalid scopes, tools and resource URLs still fail at startup.

On Cloudflare Workers, pass `publishableKey` and `secretKey` from `env` unless `process.env` is populated, which needs `nodejs_compat` and a compatibility date of `2025-04-01` or later.

### Usage

`createClerkMcpAuth()` is the single entry point. Import it from the root for plain `fetch` runtimes (Cloudflare Workers, Deno, Bun), or from a framework subpath for handlers in that framework's shape.

```ts
import { createClerkMcpAuth } from '@clerk/mcp-tools/hono';
import { createMcpHonoApp } from '@modelcontextprotocol/hono';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const clerkMcp = createClerkMcpAuth({
  resource: 'https://mcp.example.com/mcp',
  scopes: [
    { scope: 'notes:read', label: 'Read notes' },
    { scope: 'notes:write', label: 'Write notes' },
  ],
  baselineScopes: ['notes:read'],
  tools: {
    list_notes: ['notes:read'],
    create_note: ['notes:write'],
  },
});

function createServer() {
  const server = new McpServer({ name: 'notes', version: '1.0.0' });

  server.registerTool(
    'list_notes',
    { inputSchema: z.object({}) },
    clerkMcp.withScopes('list_notes', async (_args, ctx) => {
      const userId = ctx.http?.authInfo?.extra?.userId;
      return { content: [{ type: 'text', text: `notes for ${userId}` }] };
    }),
  );

  return server;
}

// Validates the Host and Origin headers and parses JSON bodies.
const app = createMcpHonoApp({ allowedHosts: ['mcp.example.com'] });

app.get('/.well-known/oauth-protected-resource/mcp', clerkMcp.protectedResourceMetadata());
app.all('/mcp', clerkMcp.mcpHandler(createServer));

export default app;
```

`mcpHandler()` authorizes every request before it builds a server. `requireAuth()` is for your own routes.

### How requests are authorized

1. The `tools/call` messages in the request body are looked up in `tools`.
2. Without a bearer token the answer is `401`, with `scope` set to `baselineScopes` plus the scopes of the requested tools, in the order of `scopes`.
3. A token is verified, and refused when it has expired or was not issued for `resource`.
4. A token that lacks a requested tool's scopes gets `403 insufficient_scope`, listing the token's scopes plus the missing ones so the client can step up. Set `insufficientScope: 'tool-error'` to let the call through and return a tool error instead.
5. `withScopes()` checks the grant again when the tool runs, records telemetry, and returns a labeled permission error when scopes are missing.

A tool that is not in `tools` needs only a valid token. `withScopes()` throws at startup for a tool without an entry, so register every scoped tool through it.

`baselineScopes` keeps the first consent small and is what `scopes_supported` advertises. Tools outside the baseline are only reachable from clients that handle the `403` step-up challenge. Leave `baselineScopes` unset to request every scope at sign-in, which works with every client.

Argument-dependent scopes are functions:

```ts
tools: {
  get_instance_keys: args =>
    (args as { include_secret_key?: boolean }).include_secret_key
      ? ['applications:read', 'application_secret_keys:read']
      : ['applications:read'],
}
```

### Serving more than one hostname

Pass a function to derive the resource from each request, for preview deployments or a server with several domains:

```ts
const clerkMcp = createClerkMcpAuth({
  resource: request => new URL('/mcp', request.url),
});
```

The function decides which tokens are accepted. Only use it behind Host header validation, such as `createMcpHonoApp({ allowedHosts })`.

### Express

```ts
import { createClerkMcpAuth } from '@clerk/mcp-tools/express';
import express from 'express';

const clerkMcp = createClerkMcpAuth({ resource: 'https://mcp.example.com/mcp', tools: { list_notes: ['notes:read'] } });
const app = express();

app.get('/.well-known/oauth-protected-resource/mcp', clerkMcp.protectedResourceMetadata());
app.all('/mcp', clerkMcp.mcpHandler(createServer));
```

The Express binding needs `@modelcontextprotocol/node`. It parses JSON bodies itself when no body parser ran. `requireAuth()` protects your own routes and exposes the verified `AuthInfo` as `req.auth`.

### Next.js

```ts
// app/mcp/route.ts
import { createClerkMcpAuth } from '@clerk/mcp-tools/next';

const clerkMcp = createClerkMcpAuth({ resource: 'https://mcp.example.com/mcp', tools: { list_notes: ['notes:read'] } });
const handler = clerkMcp.mcpHandler(createServer);

export { handler as GET, handler as POST, handler as DELETE };
```

```ts
// app/.well-known/oauth-protected-resource/mcp/route.ts
const handler = clerkMcp.protectedResourceMetadata();

export { handler as GET, handler as OPTIONS };
```

`requireAuth(handler)` wraps any `(request: Request) => Response` route handler and exposes the verified `AuthInfo` as `request.auth`.

### Cloudflare Workers and plain fetch

```ts
import { createClerkMcpAuth } from '@clerk/mcp-tools';

const clerkMcp = createClerkMcpAuth({ resource: 'https://mcp.example.com/mcp', tools: { list_notes: ['notes:read'] } });
const mcp = clerkMcp.mcpHandler(createServer);
const metadata = clerkMcp.protectedResourceMetadata();

export default {
  fetch(request: Request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/.well-known/oauth-protected-resource/mcp') return metadata(request);
    if (pathname === '/mcp') return mcp(request);
    return new Response('Not found', { status: 404 });
  },
};
```

### Calling downstream APIs

Never forward the caller's token. Configure `tokenExchange` with the OAuth client that represents your server, then exchange the caller's token for one scoped to the downstream API:

```ts
const clerkMcp = createClerkMcpAuth({
  resource: 'https://mcp.example.com/mcp',
  tools: { list_notes: ['notes:read'] },
  tokenExchange: { clientId: process.env.OAUTH_CLIENT_ID!, clientSecret: process.env.OAUTH_CLIENT_SECRET! },
});

clerkMcp.withScopes('list_notes', async (_args, ctx) => {
  const { accessToken } = await clerkMcp.exchangeToken(ctx.http!.authInfo!, {
    resource: 'https://api.example.com',
    scopes: ['notes:read'],
  });
  const response = await fetch('https://api.example.com/v1/notes', {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  return { content: [{ type: 'text', text: await response.text() }] };
});
```

`exchangeToken()` refuses scopes the caller's token does not carry, and fails with a `ClerkMcpError` whose `code` is stable: `insufficient_scope`, `rejected`, `forbidden`, `rate_limited`, `unavailable` or `configuration`.

Exchanged tokens are cached per subject, resource and scope set until they near expiry, so a cached token outlives the revocation of the caller's token. Set `tokenExchange.cache` to `false` to exchange on every call.

### Browser-based clients

Clients that run in a browser, such as the MCP Inspector, need CORS on the MCP route. Allow the `Authorization`, `Content-Type`, `MCP-Protocol-Version`, `Mcp-Method` and `Mcp-Name` request headers. Challenges expose `WWW-Authenticate` on their own, and the metadata handlers send their own CORS headers.

### Clients that predate protected resource metadata

Older clients look for `/.well-known/oauth-authorization-server` on the MCP server's origin. `clerkMcp.authorizationServerMetadata()` relays that document from Clerk and caches it for an hour, so it always matches your instance's settings, dynamic client registration included.

### Telemetry

```ts
const clerkMcp = createClerkMcpAuth({
  resource: 'https://mcp.example.com/mcp',
  telemetry: event => console.log(JSON.stringify(event)),
});
```

Events cover authentication outcomes with a failure reason, tool invocations with their duration, and token exchanges with the token endpoint's status. Tokens and secrets are never included.

### Options

| Option                       | Description                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `resource`                   | The absolute URL of your MCP endpoint, or a function of the request. Tokens must be issued for it.                     |
| `publishableKey`             | Derives the Clerk authorization server. Defaults to `CLERK_PUBLISHABLE_KEY`.                                           |
| `authorizationServerUrl`     | The authorization server's origin. Replaces the one derived from `publishableKey`.                                     |
| `secretKey`, `jwtKey`        | Used to verify tokens. Default to `CLERK_SECRET_KEY` and `CLERK_JWT_KEY`. At least one is required.                    |
| `apiUrl`, `apiVersion`       | The Clerk Backend API origin and version. Default to `CLERK_API_URL` and `CLERK_API_VERSION`.                          |
| `clockSkewInMs`              | Tolerated clock difference between Clerk and your server.                                                              |
| `scopes`                     | Every scope this server understands, with optional labels. Sets the order of challenge scopes.                         |
| `baselineScopes`             | Scopes requested at the first sign-in and advertised as `scopes_supported`. Defaults to all of `scopes`.               |
| `tools`                      | Scopes each tool needs, as a list or a function of the tool's arguments.                                               |
| `insufficientScope`          | `'challenge'` (default) answers `403` before dispatch, `'tool-error'` lets `withScopes()` return a tool error instead. |
| `requireResourceBinding`     | Refuse tokens without an audience. Defaults to `true`.                                                                 |
| `verifier`                   | A custom `OAuthTokenVerifier`. Replaces Clerk token verification.                                                      |
| `tokenExchange`              | The OAuth client credentials used by `exchangeToken()`, an optional `tokenEndpoint`, and `cache`.                      |
| `metadata.protectedResource` | Extra RFC 9728 properties for the protected resource metadata document, such as `resource_name`.                       |
| `telemetry`                  | A sink for telemetry events.                                                                                           |

### Troubleshooting

**`The access token is not bound to a resource.`** The token has no audience. Either the client sent no `resource` parameter when it requested the token, or the token is opaque and the installed `@clerk/backend` does not report its audience. Enable **Generate access tokens as JWTs** for the instance. A token with several audiences also counts as unbound, and Clerk issues tokens for a single resource. `requireResourceBinding: false` accepts unbound tokens, including ones that were requested for other servers of the same instance.

**`The access token is bound to another resource.`** The token's audience is not `resource`. Compare `resource` with the URL the client connects to, including the path and any trailing slash.

### Migrating from 0.x

| Before                                             | Now                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `verifyClerkToken(auth, token)`                    | `createClerkMcpAuth({ ... }).verifier` or `createClerkOAuthTokenVerifier()`                       |
| `mcpAuthClerk` and `streamableHttpHandler(server)` | `clerkMcp.mcpHandler(() => server)`, which authorizes on its own, with a fresh server per request |
| `protectedResourceHandlerClerk(properties)`        | `clerkMcp.protectedResourceMetadata()`                                                            |
| `authServerMetadataHandlerClerk`                   | `clerkMcp.authorizationServerMetadata()`                                                          |
| `@modelcontextprotocol/sdk`                        | `@modelcontextprotocol/server`                                                                    |

The resource URL is now configured rather than derived from each request, and tokens are refused unless they were issued for it. The client helpers from `@clerk/mcp-tools/client` and the stores are not part of this package yet.

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_mcp_tools)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/mcp-tools` follows good practices of security, but 100% security cannot be assured.

`@clerk/mcp-tools` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/mcp-tools/LICENSE) for more information.
