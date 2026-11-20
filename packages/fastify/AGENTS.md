## Clerk + Fastify

Read the installed `@clerk/fastify` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Register the plugin with `fastify.register(clerkPlugin)` from `@clerk/fastify`. It targets Fastify `5.x`.
- The plugin runs on the `preHandler` hook by default. `hookName: 'onRequest'` is the only alternative.
- Read auth with `getAuth(req)`. It throws if `clerkPlugin` is not registered.
- Use the `clerkClient` exported from `@clerk/fastify` for Backend API calls.
- Verify webhooks with `verifyWebhook(req)` from `@clerk/fastify/webhooks`.
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
