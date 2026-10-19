## Clerk + React Router

Read the installed `@clerk/react-router` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Enable `future.v8_middleware` in `react-router.config.ts`, then export `middleware = [clerkMiddleware()]` from the root route.
- Import `clerkMiddleware`, `rootAuthLoader`, and `getAuth` from `@clerk/react-router/server`. Without the middleware, `rootAuthLoader` and `getAuth` throw.
- Do not import from `@clerk/react-router/ssr.server` (deprecated) or `@clerk/react-router/api.server`. Use `@clerk/react-router/server`.
- Pass the root loader's data to `<ClerkProvider loaderData={loaderData}>`.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/react-router` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
