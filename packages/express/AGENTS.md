## Clerk + Express

Read the installed `@clerk/express` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Mount `app.use(clerkMiddleware())` from `@clerk/express` before any route that reads auth.
- Read auth with `getAuth(req)`. `req.auth` is a function now, so `const { userId } = req.auth` does not work.
- Protect routes with `clerkMiddleware()` and a `getAuth(req).userId` check. `requireAuth()` is deprecated.
- `@clerk/express` does not export `ClerkExpressRequireAuth()` or `ClerkExpressWithAuth()`. Use `clerkMiddleware()`, `getAuth()`, and the exported `clerkClient`.
- The `enableHandshake` option is removed.
- Verify webhooks with `verifyWebhook(req)` from `@clerk/express/webhooks`.
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
