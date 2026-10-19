## Clerk + Fastify

Read the installed `@clerk/fastify` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Register the plugin with `fastify.register(clerkPlugin)` from `@clerk/fastify`. It targets Fastify `5.x`.
- The plugin runs on the `preHandler` hook by default. `hookName: 'onRequest'` is the only alternative.
- Read auth with `getAuth(req)`. It throws if `clerkPlugin` is not registered.
- Use the `clerkClient` exported from `@clerk/fastify` for Backend API calls.
- Verify webhooks with `verifyWebhook(req)` from `@clerk/fastify/webhooks`.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/fastify` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
