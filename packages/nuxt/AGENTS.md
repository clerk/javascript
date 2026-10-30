## Clerk + Nuxt

Read the installed `@clerk/nuxt` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Add `'@clerk/nuxt'` to `modules` and put options under the `clerk` key. Nuxt 4 is required.
- The server middleware registers itself. In server routes, use `event.context.auth()`. `getAuth()` was removed.
- `createRouteMatcher()` was removed on both server and client. Check auth inside each event handler. For pages, write a named route middleware that calls `useAuth()` and opt pages in with `definePageMeta({ middleware: 'auth' })`.
- `<Show>` is auto-imported and replaces `<SignedIn>`, `<SignedOut>`, and `<Protect>`.
- `<SignIn>`, `<SignUp>`, `<UserProfile>`, `<OrganizationProfile>`, `<CreateOrganization>`, and `<OrganizationList>` default to `path` routing.
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
