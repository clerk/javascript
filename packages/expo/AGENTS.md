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

## Verifying changes

Prove every change to `@clerk/expo` or `@clerk/expo-native-components` on a simulator or emulator before calling it done, and put the screenshots or video in the pull request's description, never in a comment. How you prove it is up to you. The verification skill in this repository is one way, and it also works on a machine with no device. An app of your own that exercises the change is just as good. If you could not run it on a device at all, say so in the pull request.

Show a before and an after of every screen the change touches, and of every state of those screens, including a state that should look the same after the change. Lay them out in a table, with each before beside its after, as `attach` does. When a test user cannot reach a state with the standard instance settings and default roles, and no settings or test data can, force it with a small local patch on both builds. Never commit the patch, and say in the pull request what it changed and why. When you review a pull request that changes SDK or UI code, check that its evidence covers every screen and state the diff touches.

The skill is `.claude/skills/verify-clerk-expo/`: read its `SKILL.md` first. The tests and the CLI that runs them are in `integration/expo-native/`. The skill needs a Clerk Platform API key, which Clerk team members have.

Use only test users: `+clerk_test` emails, phones 555-0100 to 555-0199, and the code `424242`.
