## Clerk + Backend

Read the installed `@clerk/backend` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Create the client with `createClerkClient({ secretKey, publishableKey })` from `@clerk/backend`.
- Authenticate a Fetch `Request` with `await clerkClient.authenticateRequest(request)`. Check `requestState.isAuthenticated`, not the deprecated `isSignedIn`, then read auth from `requestState.toAuth()`.
- Verify machine tokens with `verify()`: `clerkClient.apiKeys.verify(secret)`, `clerkClient.m2m.verify(params)`, `clerkClient.idPOAuthAccessToken.verify(token)`. `verifySecret()`, `verifyAccessToken()`, and `m2m.verifyToken()` are removed. The top-level `verifyToken()` export still exists.
- Verify webhooks with `verifyWebhook(request)` from `@clerk/backend/webhooks`. It reads `CLERK_WEBHOOK_SIGNING_SECRET` by default.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/backend` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
