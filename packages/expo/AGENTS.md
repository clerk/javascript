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

<!-- BEGIN:clerk-mcp -->

### Clerk MCP server

Use this section when a `clerk` MCP server (`https://mcp.clerk.com/mcp`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (`list_clerk_sdk_snippets`, `clerk_sdk_snippet`) instead of writing it from memory.
- Check every import in a snippet against the installed `@clerk/expo` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account. Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add `.md` to any docs URL to get Markdown.

<!-- END:clerk-mcp -->

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
