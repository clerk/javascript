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
