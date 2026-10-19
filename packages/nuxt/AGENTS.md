## Clerk + Nuxt

Read the installed `@clerk/nuxt` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Add `'@clerk/nuxt'` to `modules` and put options under the `clerk` key. Nuxt 4 is required.
- The server middleware registers itself. In server routes, use `event.context.auth()`. `getAuth()` was removed.
- `createRouteMatcher()` was removed on both server and client. Check auth inside each event handler. For pages, write a named route middleware that calls `useAuth()` and opt pages in with `definePageMeta({ middleware: 'auth' })`.
- `<Show>` is auto-imported and replaces `<SignedIn>`, `<SignedOut>`, and `<Protect>`.
- `<SignIn>`, `<SignUp>`, `<UserProfile>`, `<OrganizationProfile>`, `<CreateOrganization>`, and `<OrganizationList>` default to `path` routing.
- Clerk Elements is removed. Never use it.

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/nuxt` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->
