## Clerk + Electron

Read the installed `@clerk/electron` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- In the main process, call `createClerkBridge({ storage: storage(), renderer: { scheme, host } })` from `@clerk/electron`, with `storage` from `@clerk/electron/storage`. Call it before `app.whenReady()`.
- In the preload script, call `exposeClerkBridge()` from `@clerk/electron/preload`.
- In the renderer, import `ClerkProvider`, hooks, and components from `@clerk/electron/react`, not `@clerk/react`.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed in Core 3. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
- For passkeys, pass `passkeys` from `@clerk/electron/passkeys` to `ClerkProvider`.
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
