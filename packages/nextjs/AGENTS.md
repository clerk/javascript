## Clerk + Next.js

Read the installed `@clerk/nextjs` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Run `clerkMiddleware()` from `@clerk/nextjs/server` in `proxy.ts` on Next.js 16, or in `middleware.ts` on Next.js 15. `authMiddleware()` is not exported.
- Protect routes inside `clerkMiddleware()` with `createRouteMatcher()` and `await auth.protect()`.
- Import `auth()` and `currentUser()` from `@clerk/nextjs/server`, never from `@clerk/nextjs`. Both are async. Always `await` them.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` throw in Core 3. Use `<Show when="signed-in">`, `<Show when="signed-out">`, or `<Show when={{ permission: 'org:billing:manage' }}>`.
- `useSignIn()` and `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. The old `{ isLoaded, signIn, setActive }` shape lives in `@clerk/nextjs/legacy`.
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
