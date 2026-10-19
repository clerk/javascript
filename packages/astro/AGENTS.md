## Clerk + Astro

Read the installed `@clerk/astro` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Register the default export of `@clerk/astro` in `integrations` in `astro.config`. `server` output needs an adapter.
- Use `clerkMiddleware()` from `@clerk/astro/server` in `src/middleware.ts`.
- `createRouteMatcher()` was removed. Check auth in each page or API route with `Astro.locals.auth()` or `locals.auth()`, then call `redirectToSignIn()` or return a 401.
- `locals.currentUser()` returns the Backend `User` or `null`.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Import `<Show>` from `@clerk/astro/components` (or `@clerk/astro/react`). Its `when` prop is required, for example `<Show when="signed-in">`.
- The `as` prop was removed from `<SignInButton>`, `<SignUpButton>`, and `<SignOutButton>`. Use `asChild` with a child element.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/astro` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
