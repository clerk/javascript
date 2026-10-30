## Clerk + React

Read the installed `@clerk/react` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- The package is `@clerk/react`. `@clerk/clerk-react` was renamed.
- `<SignedIn>`, `<SignedOut>`, and `<Protect>` were removed. Use `<Show when="signed-in">`, `<Show when="signed-out">`, or `<Show when={{ role: 'admin' }}>`.
- `useSignIn()` and `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. The old `{ isLoaded, signIn, setActive }` shape lives in `@clerk/react/legacy`.
- `afterSignInUrl`, `afterSignUpUrl`, and `redirectUrl` were removed. Use `fallbackRedirectUrl` / `signUpFallbackRedirectUrl` or `forceRedirectUrl` / `signUpForceRedirectUrl`.
- `appearance.layout` was renamed to `appearance.options`.
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
