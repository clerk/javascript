## Clerk + Next.js

Read the installed `@clerk/nextjs` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Run `clerkMiddleware()` from `@clerk/nextjs/server` in `proxy.ts` on Next.js 16, or in `middleware.ts` on Next.js 15. `authMiddleware()` is not exported.
- Protect routes inside `clerkMiddleware()` with `createRouteMatcher()` and `await auth.protect()`.
- Import `auth()` and `currentUser()` from `@clerk/nextjs/server`, never from `@clerk/nextjs`. Both are async. Always `await` them.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` throw in Core 3. Use `<Show when="signed-in">`, `<Show when="signed-out">`, or `<Show when={{ permission: 'org:billing:manage' }}>`.
- `useSignIn()` and `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. The old `{ isLoaded, signIn, setActive }` shape lives in `@clerk/nextjs/legacy`.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/nextjs` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
