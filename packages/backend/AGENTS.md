## Clerk + Backend

Read the installed `@clerk/backend` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Create the client with `createClerkClient({ secretKey, publishableKey })` from `@clerk/backend`.
- Authenticate a Fetch `Request` with `await clerkClient.authenticateRequest(request)`. Check `requestState.isAuthenticated`, not the deprecated `isSignedIn`, then read auth from `requestState.toAuth()`.
- Verify machine tokens with `verify()`: `clerkClient.apiKeys.verify(secret)`, `clerkClient.m2m.verify(params)`, `clerkClient.idPOAuthAccessToken.verify(token)`. `verifySecret()`, `verifyAccessToken()`, and `m2m.verifyToken()` are removed. The top-level `verifyToken()` export still exists.
- Verify webhooks with `verifyWebhook(request)` from `@clerk/backend/webhooks`. It reads `CLERK_WEBHOOK_SIGNING_SECRET` by default.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-plugin -->

### Clerk plugin

The Clerk plugin gives agents Clerk's skills and MCP server. If it is not installed, tell the user they can install it. Do not run the command yourself:

```sh
npx plugins add clerk/skills
```

Install steps for each tool: https://clerk.com/docs/guides/ai/overview
Source: https://github.com/clerk/skills

Ask the user before calling any Clerk tool that creates or changes something in their Clerk account.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-plugin -->
