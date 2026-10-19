## Clerk + Chrome Extension

Read the installed `@clerk/chrome-extension` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Pass `publishableKey` to `<ClerkProvider>`. There is no env var fallback. Pass `syncHost` to sync sessions with your web app.
- In the background service worker, use `createClerkClient()` from `@clerk/chrome-extension/background`. `__unstable__createClerkClient` was renamed.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
- `<GoogleOneTap>` renders nothing in extensions.
- The root `useSignIn()` and `useSignUp()` are the Core 3 hooks. The old `isLoaded`-style hooks are in `@clerk/chrome-extension/legacy`.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/chrome-extension` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
