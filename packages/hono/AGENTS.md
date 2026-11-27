## Clerk + Hono

Read the installed `@clerk/hono` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Mount `app.use('*', clerkMiddleware())` from `@clerk/hono`. It reads `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` from the Hono env.
- Read auth with `getAuth(c)`. Pass the Hono context, not a request.
- Get the Backend API client with `c.get('clerk')`. `@clerk/hono` does not export `clerkClient`.
- Accept API keys with `getAuth(c, { acceptsToken: 'api_key' })`.
- Verify webhooks with `verifyWebhook(c)` from `@clerk/hono/webhooks`.
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
