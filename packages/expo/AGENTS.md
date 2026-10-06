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

Prove a change to this package's UI or auth behavior on a simulator or emulator before calling it done. The skill is `.claude/skills/verify-clerk-expo/`: read its `SKILL.md` and `features/README.md` first. Run the commands below from the repo root, after `pnpm install` and `npm ci --prefix .claude/skills/verify-clerk-expo` once per worktree. The skill sits outside the pnpm workspace and installs its own pinned `e2e` from its own lockfile.

1. `.claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios` (or `android`) checks the machine. Fix what it names.
2. `.claude/skills/verify-clerk-expo/bin/control-clerk-expo up --platform ios` builds the dev client, creates a throwaway Clerk application, leases a device, and starts Metro.
3. `.claude/skills/verify-clerk-expo/bin/control-clerk-expo run <feature> --platform ios` runs that feature's golden specs and keeps video, screenshots, and state under `.claude/skills/verify-clerk-expo/.verify/runs/`.
4. `.claude/skills/verify-clerk-expo/bin/control-clerk-expo down` releases the device, deletes the throwaway application and its users, and keeps the evidence.

Use only test users: `+clerk_test` emails and the code `424242`. Never type real credentials.
