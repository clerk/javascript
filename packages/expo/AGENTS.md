## Clerk + Expo

Read the installed `@clerk/expo` types before changing auth code. If a symbol is not in those types, it does not exist.

### Current APIs

- The package is `@clerk/expo`. `@clerk/clerk-expo` was renamed. The `Clerk` export was removed; use `getClerkInstance()`. Expo SDK 54+ is required.
- Pass `publishableKey` to `<ClerkProvider>`. Env vars are no longer read. Pass `tokenCache` from `@clerk/expo/token-cache`.
- Import `useSignInWithApple` from `@clerk/expo/apple` and `useSignInWithGoogle` from `@clerk/expo/google`. Google also needs `@clerk/expo-google-signin` in `plugins`.
- For browser OAuth or SSO, use `useSSO()`. `useOAuth()` is deprecated.
- Import native UI (`AuthView`, `UserButton`, `UserProfileView`) from `@clerk/expo/native-components`. It needs `@clerk/expo-native-components` installed and listed in `plugins`. `@clerk/expo/native` is deprecated.
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

## Contributing to @clerk/expo

These rules apply to everything in this package, and to the Swift and Kotlin
code under `packages/expo-native-components`, `packages/expo-google-signin` and
`packages/expo-biometrics`. They add to the root `AGENTS.md`.

### Comments

Don't write comments unless they explain a constraint from a platform, library,
or spec that we can't change. If our own code needs explaining, change the code:
rename it, give it a type, extract a helper, or pin it with a test.

Keep license headers, doc comments on public API, and `// MARK:` or `// region`
markers. Don't leave commented-out code.
