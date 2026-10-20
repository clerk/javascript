## Clerk + TanStack React Start

Read the installed `@clerk/tanstack-react-start` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- Register `clerkMiddleware()` from `@clerk/tanstack-react-start/server` in `requestMiddleware` of `createStart()` in `src/start.ts`. Without it, `auth()` throws.
- Register `createCsrfMiddleware()` from `@tanstack/react-start` before `clerkMiddleware()`. Having a `src/start.ts` turns off TanStack Start's default CSRF protection for server functions.
- On the server, call `await auth()` from `@clerk/tanstack-react-start/server` with no request argument. `getAuth(request)` is gone.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">` or `<Show when="signed-out">`.
- `useSignIn()` and `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. The old shape lives in `@clerk/tanstack-react-start/legacy`.
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
