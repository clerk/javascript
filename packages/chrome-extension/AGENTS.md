## Clerk + Chrome Extension

Read the installed `@clerk/chrome-extension` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Pass `publishableKey` to `<ClerkProvider>`. There is no env var fallback. Pass `syncHost` to sync sessions with your web app.
- In the background service worker, use `createClerkClient()` from `@clerk/chrome-extension/background`. `__unstable__createClerkClient` was renamed.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
- `<GoogleOneTap>` renders nothing in extensions.
- The root `useSignIn()` and `useSignUp()` are the Core 3 hooks. The old `isLoaded`-style hooks are in `@clerk/chrome-extension/legacy`.
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
