## Clerk + React Router

Read the installed `@clerk/react-router` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Enable `future.v8_middleware` in `react-router.config.ts`, then export `middleware = [clerkMiddleware()]` from the root route.
- Import `clerkMiddleware`, `rootAuthLoader`, and `getAuth` from `@clerk/react-router/server`. Without the middleware, `rootAuthLoader` and `getAuth` throw.
- Do not import from `@clerk/react-router/ssr.server` (deprecated) or `@clerk/react-router/api.server`. Use `@clerk/react-router/server`.
- Pass the root loader's data to `<ClerkProvider loaderData={loaderData}>`.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
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
