---
'@clerk/mcp-tools': minor
---

Rewrite `@clerk/mcp-tools` around the MCP TypeScript SDK v2 (`@modelcontextprotocol/server`).

`createClerkMcpAuth()` replaces the per-framework helpers and covers every resource-server concern in one place:

- The `401` challenge with the `WWW-Authenticate` scope list and `resource_metadata` pointer, and the `403 insufficient_scope` step-up challenge driven by a per-tool scope map. Missing scopes can instead surface as a tool error through `insufficientScope: 'tool-error'`.
- Token verification through `@clerk/backend` that refuses tokens issued for another resource and populates `expiresAt` as SDK v2 requires. `resource` can be a function of the request for servers with more than one hostname.
- `mcpHandler()`, which authorizes every request before it builds a server, and `withScopes()` to guard tool callbacks at call time and record telemetry.
- RFC 9728 protected resource metadata that advertises `baselineScopes` as `scopes_supported`, and a relay of the authorization server's RFC 8414 metadata for clients that look for it on the MCP server's origin.
- `exchangeToken()`, an RFC 8693 token exchange client with a per-subject cache and stable `ClerkMcpError` codes.
- A `telemetry` sink for auth, tool and exchange events.
- Bindings for Hono (`@clerk/mcp-tools/hono`), Express (`@clerk/mcp-tools/express`), Next.js (`@clerk/mcp-tools/next`) and plain `fetch` runtimes such as Cloudflare Workers (`@clerk/mcp-tools`).

Breaking changes: `verifyClerkToken`, `mcpAuthClerk`, `protectedResourceHandlerClerk`, `authServerMetadataHandlerClerk` and `streamableHttpHandler` are replaced by the methods on `createClerkMcpAuth()`, the resource URL is configured instead of derived from each request, and the MCP client helpers and stores are not included.
