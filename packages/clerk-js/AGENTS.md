## Clerk + ClerkJS

Read the installed `@clerk/clerk-js` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Import `Clerk` from `@clerk/clerk-js` and `await clerk.load()` before using it.
- Prebuilt UI components come from `@clerk/ui`, which loads from the Clerk CDN.
- `client.activeSessions` was removed. Use `client.sessions`.
- `setActive({ beforeEmit })` was replaced by `setActive({ navigate: ({ session }) => url })`.
- `session.getToken()` throws `ClerkOfflineError` when offline. It no longer returns `null`.
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
