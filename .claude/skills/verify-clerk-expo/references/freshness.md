# How a change reaches the app

Read this when a local run launches old code, when `up` or `run` fails with `NOT_READY` about a stale `dist`, or when you change something other than `packages/expo/src`. Terms: the watch build is `tsdown --watch` in `packages/expo`, which keeps `packages/expo/dist` current. `dist` is a package's build output, and Metro bundles the app from it.

## What forces a native rebuild

The build key is a hash of the contents of every tracked or untracked-and-not-ignored file under these paths, except Markdown, `docs/`, `.claude/`, and `.verify/`:

- For the platform: `packages/expo/ios` or `android`, and the same directory of `packages/expo-google-signin` and `packages/expo-biometrics`.
- For both platforms: in `packages/expo`, `app.plugin.js`, `src/specs/`, `expo-module.config.json`, `react-native.config.js`, and `package.json`; in `packages/expo-google-signin`, `app.plugin.js`, `expo-module.config.json`, and `package.json`; in `packages/expo-biometrics`, `expo-module.config.json` and `package.json`; and in the test app, `app.json`, `app.config.js`, `package.sdk-57.json`, `pnpm-workspace.yaml`, and `modules/`.

`src/fixture.ts` holds the same list as `nativeInputs`. When the key changes, `up` runs `turbo build` for the three packages and their workspace dependencies (`@clerk/clerk-js`, `@clerk/shared`, and `@clerk/react` among them), links the packages into the test app with `pnpm add`, runs `expo install` and `expo prebuild --clean`, then `xcodebuild` or `gradlew assembleDebug`. While this worktree's watch build runs, it prints `the running watch build keeps packages/expo/dist current, so turbo build is skipped` instead of the `turbo build` step. Any other change, such as a hook in `packages/expo/src` or a screen of the test app, reuses the build.

## The three checks before the specs start

`up` and `run` make these checks in order, and `run` starts its specs only when all three pass.

1. **Workspace packages.** The CLI rebuilds a package with `expo-module.config.json` (`@clerk/expo-biometrics`) when its source changed since its `dist` was built, and prints a `build ... src changed since dist was built` line. Every other dependency (`@clerk/shared`, `@clerk/react`, `@clerk/clerk-js`) is yours to build. When its source, or the source of a workspace package it depends on, changed since its `dist` was built, `run` fails `NOT_READY`, names the packages, and prints the command: run `down`, so no Metro watches a `dist` being cleaned, then `pnpm turbo build --force --filter=<each stale package>`, then rerun. The list includes `@clerk/clerk-js` when only `@clerk/shared` changed, because `@clerk/clerk-js` bundles its own copy of `@clerk/shared`.
2. **The watch build.** `packages/expo/dist` must be newer than every file tsdown builds from `packages/expo/src`.
3. **Metro.** `run` waits until Metro's bundle has the code in `dist`. It prints `<n> served file(s) changed since the last launch; waiting until Metro's <platform> bundle has the new code`, or `no served file changed since the last launch`. A bundling error fails with Metro's message. If Metro never catches up within 300 seconds, `run` fails `NOT_READY` and names the Metro log, instead of running specs on old code.

## Metro ports and logs

Metro ports are fixed per lane, so no two lanes collide. iOS lanes 1 to 4 use 8082 to 8085, and Android lanes 1 and 2 use 8086 and 8087. Logs for the watch build and each Metro are in `.verify/runtime/` (`watch.log`, `metro-<port>.log`). Each start appends to its log under a `==== <name> started <time>` line, so a Metro restart keeps earlier lines.

Metro runs with `EXPO_OFFLINE=1`. Without it, the Expo CLI calls expo.dev, and when the machine uses an HTTPS proxy the call can time out (`UnexpectedServerError: HTTP Proxy timed out`).

## Reading a run's part of the Metro log

Fast Refresh stays on. When you save a JS change while an app from an earlier run is still open, Metro hot-reloads it into that app first, so the change's console lines appear once under the earlier run, then again when this run's launch loads the bundle. To see which code a run launched, read this run's whole window of `.verify/runtime/metro-<port>.log`: from the bundle load that precedes this run's first `[verify]` console line with this run's `runId`, through the line before the next run's first `[verify]` line. Module-level logs print before the first `[verify]` line, and logs from taps print after the last one. A match before that window belongs to an earlier run.

## Known gap

The check dates a Metro revision it has not seen before by the second it was built. If two edits land within the same second, or an edit is reverted while Metro's watcher is still behind, the check can, rarely, launch a bundle one edit older than `dist`. Touching files cannot force a newer revision, because Metro skips modules whose transform key did not change.

## Troubleshooting

- A machine behind an HTTPS debugging proxy needs the proxy's CA trusted by `Clerk Verify Template iOS` before lanes are cloned from it. `doctor` reports it as `proxy-trust` and prints the fix.
- If `up` says port 8082 (or another lane's port) already serves a Metro this worktree did not start, stop the process that listens on it: `lsof -nP -iTCP:8082 -sTCP:LISTEN` finds it.
