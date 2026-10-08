# @clerk/expo

These rules apply to everything in this package, including the Swift and Kotlin
code under `ios/`, `apple/` and `android/`. They add to the root `AGENTS.md`.

## Comments

Don't write comments unless they explain a constraint from a platform, library,
or spec that we can't change. If our own code needs explaining, change the code:
rename it, give it a type, extract a helper, or pin it with a test.

Keep license headers, doc comments on public API, and `// MARK:` or `// region`
markers. Don't leave commented-out code.

## Verifying changes

Prove every change to `@clerk/expo` or `@clerk/expo-native-components` on a simulator or emulator before calling it done, and put the screenshots or video on the pull request. How you prove it is up to you. The verification skill in this repository is one way. An app of your own that exercises the change is just as good. If you could not run it on a device at all, say so in the pull request.

The skill is `.claude/skills/verify-clerk-expo/`: read its `SKILL.md` first. The tests and the CLI that runs them are in `integration/expo-native/`. The skill needs a Clerk Platform API key, which Clerk team members have.

Use only test users: `+clerk_test` emails, phones 555-0100 to 555-0199, and the code `424242`.
