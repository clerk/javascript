# How a change reaches the app

Read this when a run launches old code, when `up` or `run` fails with `NOT_READY` about a stale `dist`, or when you change something other than `packages/expo/src`. Terms: the watch build is `tsdown --watch` in `packages/expo`, which keeps `packages/expo/dist` current. `dist` is a package's build output, and Metro bundles the app from it.

## What forces a native rebuild

The build key is a hash of the contents of every tracked or untracked-and-not-ignored file under these paths, except Markdown, `docs/`, `.claude/`, and `.verify/`:

- For the platform: `packages/expo/ios` or `android`, and the same directory of `packages/expo-google-signin` and `packages/expo-biometrics`.
- For both platforms: in `packages/expo`, `app.plugin.js`, `src/specs/`, `expo-module.config.json`, `react-native.config.js`, and `package.json`; in `packages/expo-google-signin`, `app.plugin.js`, `expo-module.config.json`, and `package.json`; in `packages/expo-biometrics`, `expo-module.config.json` and `package.json`; and in the fixture, `app.json`, `app.config.js`, `package.sdk-57.json`, `pnpm-workspace.yaml`, and `modules/`.

`src/fixture.ts` holds the same list as `nativeInputs`. When the key changes, `up` runs `turbo build` for the three packages and their workspace dependencies (`@clerk/clerk-js`, `@clerk/shared`, and `@clerk/react` among them), links the packages into the fixture with `pnpm add`, runs `expo install` and `expo prebuild --clean`, then `xcodebuild` or `gradlew assembleDebug`. While this worktree's watch build runs, it prints `the running watch build keeps packages/expo/dist current, so turbo build is skipped` instead of the `turbo build` step. Any other change, such as a hook in `packages/expo/src` or a fixture screen, reuses the build.

## The three checks before the specs start

`up` and `run` make these checks in order, and `run` starts its specs only when all three pass.

1. **Workspace packages.** The CLI walks the runtime dependencies in each `package.json` through the workspace links. A package with `expo-module.config.json` (`@clerk/expo-biometrics`; `@clerk/expo-google-signin` ships no JS) is rebuilt by the CLI when its source changed since its `dist` was built: `run` stops every Metro of this worktree and the watch build, runs `pnpm turbo build --force --filter=<package>`, starts the watch build and this platform's Metro again, and prints a `build ... src changed since dist was built` line. Every other dependency (`@clerk/shared`, `@clerk/react`, `@clerk/clerk-js`) is yours to build. When its source, or the source of a workspace package it depends on, changed since its `dist` was built, `run` fails `NOT_READY`, names the packages, and prints the command: run `down`, so no Metro watches a `dist` being cleaned, then `pnpm turbo build --force --filter=<each stale package>`, then rerun. `--force` makes turbo rewrite `dist` even on a cache hit, so the check sees the build. The list includes `@clerk/clerk-js` when only `@clerk/shared` changed, because `@clerk/clerk-js` bundles its own copy of `@clerk/shared`. A file is a candidate when its modification time is newer than the package's `dist`. The CLI then compares the source content with the content it last saw the same `dist` built from, kept in `.verify/runtime/built-dependencies.json`, so a touch that changes no content is not a change, and reverting an unbuilt edit clears the refusal.
2. **The watch build.** `packages/expo/dist` must be newer than every file tsdown builds from `packages/expo/src` (test files and editor files do not count) and must hold still across two polls, so a rebuild in progress is not mistaken for a finished one.
3. **Metro.** `run` fingerprints the content of every bundled `dist` file of those packages, fetches the app's bundle URL, and fingerprints them again. If a file's content changed since the last confirmed launch and the bundle includes it, Metro must report a new revision. A rewrite with identical content, such as a comment-only edit, waits for nothing. Two reads in a row must agree before `run` launches. It prints `<n> served file(s) changed since the last launch; waiting until Metro's <platform> bundle has the new code`, or `no served file changed since the last launch`. Metro's file watcher sometimes misses a write. When the bundle stays old for 5 seconds, `run` prints `still serving an older bundle; touching <n> changed file(s) so Metro's watcher sees them` and touches those files. A bundling error fails with Metro's message once it has held for 3 seconds over unchanged `dist` files. If Metro never catches up within 300 seconds, `run` fails `NOT_READY` and names the Metro log, instead of running specs on old code.

## Metro ports and logs

Metro ports are fixed per lane, so no two lanes collide. iOS lanes 1 to 4 use 8082 to 8085, and Android lanes 1 and 2 use 8086 and 8087. Logs for the watch build and each Metro are in `.verify/runtime/` (`watch.log`, `metro-<port>.log`). Each start appends to its log under a `==== <name> started <time>` line, so a Metro restart keeps earlier lines. Runs do not copy their slice of the Metro log into the run directory.

Metro runs with `EXPO_OFFLINE=1`. Without it, the Expo CLI calls expo.dev, and when the machine uses an HTTPS proxy the call can time out (`UnexpectedServerError: HTTP Proxy timed out`).

## Reading a JS change's console line

Fast Refresh stays on. When you save a JS change while an app from an earlier run is still open, Metro hot-reloads it into that app first, so the change's console lines appear once under the earlier run, then again when this run's launch loads the bundle. To prove a JS change, read this run's whole window of `.verify/runtime/metro-<port>.log`: from the bundle load that precedes this run's first `[verify]` state line with this run's `runId`, through the line before the next run's first state line. Module-level logs print before the first state line, and logs from taps print after the last one. A match before that window belongs to an earlier run.

## Known gap

The check dates a Metro revision it has not seen before by the second it was built. If two edits land within the same second, or an edit is reverted while Metro's watcher is still behind, the check can, rarely, launch a bundle one edit older than `dist`. Touching files cannot force a newer revision, because Metro skips modules whose transform key did not change. When a JS proof matters, look for your change's own log line in this run's window.

## Troubleshooting

- A machine behind an HTTPS debugging proxy such as Proxyman needs the proxy's CA trusted by `Clerk Verify Template iOS` before lanes are cloned from it. `doctor` reports it as `proxy-trust` and prints the fix.
- If `up` says port 8082 (or another lane's port) already serves a Metro this worktree did not start, stop the process that listens on it: `lsof -nP -iTCP:8082 -sTCP:LISTEN` finds it.
