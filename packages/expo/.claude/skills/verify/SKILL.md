---
name: verify
description: Drive @clerk/expo in the expo-native fixture app (native AuthView, UserButton, UserProfileView, custom useSignIn and useSignUp flows, token cache) on a lane iOS simulator or Android emulator against a real Clerk dev instance, and capture video, screenshots, and host state as evidence. Use it to prove any change to packages/expo or the fixture works before calling it done, to reproduce a UI bug, or to run the golden regression specs.
---

# verify

`bin/verify` is a control CLI over [e2e](https://github.com/tester-army/e2e) 0.15.2 and `@e2e-dev/mobile` 0.9.0. It builds the `expo-native` fixture in `integration/templates/expo-native` as a Debug dev client, leases a lane simulator or emulator, serves `packages/expo` to it through a watch build and Metro, seeds `+clerk_test` users, runs specs, and keeps the evidence. Run every command from `packages/expo/.claude/skills/verify/`. Every verb takes `--json` and then prints one `{ "ok": ... }` object. Exit codes are 0 for ok, 1 for spec failures, 2 for usage errors, and 3 for a failed precondition. Every error carries a `fix`.

The rule: no change to `@clerk/expo` UI or auth behavior is done until a `bin/verify run` on the real host shows the changed behavior, on each platform the change touches.

## Launch

```console
$ pnpm install                                 # once, at the repo root
$ npm ci                                       # once per worktree, in this directory
$ bin/verify doctor --platform ios             # exits 3 until the first up, because build is the one failing check
$ bin/verify up --platform ios                 # build the dev client, lease verify-ios-<n>, install, start the watch build and Metro
build   ios-842c8600ed7b  local  building...
build   expo prebuild --clean --platform ios
build   xcodebuild Debug (dev client)
device  verify-ios-1  cloning Clerk Verify Template iOS
install ios-842c8600ed7b  on verify-ios-1
build   ios-842c8600ed7b  local  built in 113s
watch   packages/expo  tsdown --watch (pid 19319)
metro   :8082  expo start (pid 19320)
device  verify-ios-1  local  leased by this worktree  installed ios-842c8600ed7b
```

`--platform` is `ios` (the default) or `android`. Each platform has its own build, lease, and Metro, so a worktree can hold one of each and run them at the same time.

`up` does four things, each only when needed:

1. **Build.** The build key hashes only the native inputs for that platform: `packages/expo/ios` or `android`, `app.plugin.js`, `src/specs/`, `expo-module.config.json`, `package.json`, the sibling `expo-google-signin` and `expo-biometrics` native code, and the fixture's `app.json`, `app.config.js`, `package.sdk-57.json`, and `modules/`. When the key changes, `up` runs `turbo build` for the three packages (skipped while the watch build runs, which keeps `dist` current; otherwise it stops this worktree's Metro first), installs the fixture's dependencies with `@clerk/expo` linked to this worktree, runs `expo prebuild --clean`, and builds the dev client with `xcodebuild` or `gradlew assembleDebug` (Java 21 from Android Studio). A change anywhere else, such as `packages/expo/src/hooks/useSSO.ts` or a fixture screen, reuses the build: `up` prints `build <key> local reused`. A native rebuild takes about two minutes, and a JS-only `run` of one spec about eight seconds.
2. **Lease.** It claims a lane after the build, because a build needs no device.
3. **Install.** It installs the dev client when the lane does not have this build.
4. **Runtime.** It starts `tsdown --watch` in `packages/expo` (one per worktree) and `expo start` on the lane's Metro port. On Android it also runs `adb reverse` for that port and marks the dev menu onboarding finished, which a `-read-only` emulator forgets on every boot. Both processes are ledgered and `down` stops them. Before each launch, `run` waits until the watch build has caught up with your latest edit in `packages/expo/src`.

The lane is ready when `up` prints its last line, `device <name> local leased by this worktree installed <build key>`.

Metro ports are fixed per lane, so no two lanes on the Mac collide. iOS lanes 1 to 4 use 8082 to 8085. Android lanes 1 and 2 use 8086 and 8087. Logs for the watch build and each Metro are in `.verify/runtime/`.

A JS change reaches the app with no build. The watch build rewrites `packages/expo/dist`, Metro sees it, and the next `host.launch` relaunches the dev client, which fetches a fresh bundle. Never run `pnpm --filter @clerk/expo build` yourself while Metro runs. It deletes `dist`, and Metro can crash or stop seeing changes. `up` stops the runtime before its own builds.

`up` is idempotent, and `run` calls it itself, so `up` exists to start the slow part early. `bin/verify up &` followed by `bin/verify run ...` is fine: `run` waits for the `up` to finish and uses its lease.

Devices:

- **iOS.** The lane simulator is a clone of `Clerk Verify Template iOS`, which trusts this Mac's proxy CA. The clone is deleted and re-cloned when a lease is lost or released, so `verify-ios-<n>` can map to a different UDID from one lease to the next. Read the UDID from `.verify/leases/ios.json`.
- **Android.** The lane emulator boots `Clerk_Verify_Pixel` with `-read-only -no-window` on port 5558 + 2n, so its serial is `emulator-5560` or `emulator-5562`, and pins the `en-US` locale. `-read-only` lets two lanes share the AVD and throws away their writes.
- Never drive `iPhone Air`, the template, a physical device, or a device another worktree holds. The Mac holds at most four iOS and two Android lanes, across all agents. When all are taken, `up` and `run` fail with `POOL_FULL`. Pass `--wait <seconds>` to wait for a lane.

Each worktree runs its own agent-device daemon from its own `node_modules`, with state under `.verify/agent-device/`. If you call `agent-device` yourself, set `AGENT_DEVICE_STATE_DIR=.verify/agent-device` and use `node_modules/.bin/agent-device`.

Teardown is `bin/verify down` (see Cleanup).

## Doctor

```console
$ bin/verify doctor --platform ios --json
$ bin/verify doctor --platform android --json
```

Run it first, and again whenever anything looks off. It is read-only. It checks:

- Node 24, Xcode on iOS, and the pinned e2e and agent-device versions against the global `agent-device`.
- The iOS template simulator and the macOS proxy against the template's trust store, or the Android SDK and the `Clerk_Verify_Pixel` AVD.
- The three instances' keys by name, and each instance's enabled strategies from `/v1/environment`. Keys come from `integration/.keys.json` in the main clerk/javascript checkout, not the linked worktree. CI can pass `CLERK_TEST_KEYS_JSON` instead.
- Whether a dev client build matches the current native inputs.
- `gh pr comment --attach` support, stale device claims, drift in `src/core/`, a dead agent-device daemon, and whether every feature in the Feature Map has its feature file and a golden spec.

A failing check prints the command that fixes it, and `doctor` exits 3. Before the first `up`, only `build` fails, with fix `bin/verify up`.

## Drive

Input only goes through specs. A spec is a TypeScript file that uses the `host` fixture from `specs/fixtures.ts` and e2e's `screen` locators.

```console
$ bin/verify run native-auth-view --platform ios          # one feature (specs/golden/native-auth-view/)
$ bin/verify run user-button-and-profile --platform android
$ bin/verify run custom-flow-sign-in/request-code          # one spec, iOS by default
$ bin/verify run specs/explored/new-label.e2e.ts           # a spec you wrote
$ bin/verify run --all --skip form-entry --platform ios    # every golden spec except form entry
$ bin/verify screen --platform ios                         # current UI tree with testIds and VerifyState
$ bin/verify screen --png                                  # plus a screenshot in scratch
```

`run` flags are `--platform ios|android`, `--skip form-entry`, `--include known-bug`, `--grep <regex>`, `--no-video`, and `--wait <seconds>` (how long to wait for a free lane or for another verb in this worktree that holds the device).

The `host` fixture:

```ts
import { test, expect } from '../../fixtures.ts';

test('profile shows the seeded user', async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' }); // BAPI user, ledgered for cleanup
  const state = await host.launch({ signedInAs: user, screen: 'userProfile' }); // ticket sign-in, fresh storage
  expect(state.userId).toBe(user.id);
  await host.tap(screen.getByText('Manage account'));
  await expect(screen.getByText(user.email)).toBeVisible();
  await host.screenshot('profile'); // runs/<id>/screenshots/profile.png
});
```

- `host.launch({ instance | signedInAs, screen?, authMode?, debugLogs?, keepStorage? })` relaunches the dev client on this lane's Metro with the verify launch inputs and returns the first `VerifyState` for that launch that is ready. On iOS it passes the dev-client arguments (`--initialUrl`, dev menu off) before the verify arguments. On Android it runs `am start -n com.clerk.exponativebuildfixture/.MainActivity -d 'exp+clerk-expo-native-build-fixture://expo-development-client/?url=...' --es ...`, because a launcher intent makes expo-dev-launcher fail. Screens are `home`, `auth`, `nativeAuth`, `userButton`, `userProfile`, `customSignIn`, `customSignUp`, `sso`, and `tokenCache`. Auth modes are `signIn`, `signUp`, and `signInOrUp`.
- `host.seedUser({ instance, phone? })` creates a `+clerk_test` user. `host.newEmail(instance)` reserves an email for a form sign-up.
- `host.state()` reads the footer. `host.waitForState(predicate, timeoutMs?)` polls it.
- `host.tap(locator)` taps the middle of the node's box, and `host.fill(locator, text)` taps it and types `text`. Use them for every action inside native views. agent-device reports SwiftUI views inside the React Native host as covered and refuses `locator.tap()` and `locator.fill()` on them.
- The footer `verify.state` holds `verify ` plus one line of JSON: `screen`, `environmentLoaded`, `signedIn`, `userId`, `sessionId`, `sessionStatus`, `pendingTasks`, `orgId`, `signInStatus`, `signUpStatus`, `ticket`, `lastError`, `runId`, `launchId`, and `extra` with `authViewLoaded` and `authFlowComplete`. The values come from the JS hooks (`useAuth`, `useUser`, `useSession`, `useAuthViewState`). `screen` is what is on screen, not what was asked for. `signedIn` is true for a pending session, so read `sessionStatus`.
- Locate native iOS views with SDK identifiers, `screen.getByTestId('clerk.auth.start.identifier')`. Android native views have no tags in the pinned clerk-android release, so `specs/native.ts` finds them by text. Fixture views use their `testID`s (`verify.customSignIn.*`, `open-auth-view-button`, `auth-state`, `user-id`).
- Limit a spec to one platform with `test(title, { platforms: ['ios'] }, fn)`. It reports as skipped on the other.
- A spec tagged `known-bug` proves a defect that is not fixed yet. `run` skips it (`skipped: known-bug`) unless you pass `--include known-bug`. The fix PR removes the tag. Today that is the inline AuthView dismiss test in `native-auth-view/opens`.

There are two ways to check work.

1. **Golden specs** under `specs/golden/<feature>/` are committed, cover the Feature Map in `features/`, and run unchanged as regression. Run the features your change touches, on both platforms when the change is not platform-specific.
2. **New work.** Write a spec under `specs/explored/` (gitignored), run it, and read the end state with `bin/verify screen`. Fix locators from the `screen` output until it passes. The PR commits that spec into `specs/golden/<feature>/` and updates the feature file when the change adds or changes a user-facing behavior. Otherwise the spec stays with the run evidence (`runs/<id>/specs/` keeps a copy of every spec a run used).

An explored spec sits one level below `specs/`, so it imports the fixture as `../fixtures.ts`, where a golden spec uses `../../fixtures.ts`:

```ts
import { test, expect } from '../fixtures.ts';
```

For a JS change, edit the source, then `bin/verify run` the spec. The watch build and the relaunch carry the change, with no `up` in between. For a native change, the same `run` rebuilds the dev client first.

A failing spec prints `FAIL`, the first assertion message, and the path of its failure page, and `run` exits 1. The failure page (`runs/<id>/e2e/failures/*.md`) lists every step, the screen tree at the failure, and a screenshot. `next` points at it.

Every spec keeps at least one exact assertion on `verify.state` or an SDK identifier.

### AI judge (off by default)

e2e's `agent.assert` can judge visual claims that selectors cannot check. It is off. Golden specs never use it. To trial it in an explored spec, install `ai` (`npm i -D ai`), log in with `npx e2e login openai` (a ChatGPT Plus or Pro plan), and set `VERIFY_JUDGE_MODEL=chatgpt:<model-id>` (ids from `npx e2e models`). Without the variable the config has no model and any agent step fails.

## Test users and sign-in

Clerk's test mode makes all of this safe to type into the real app.

- **Emails.** Any address that contains `+clerk_test@` is a test address. Clerk sends no mail and accepts the code below. The fixture mints `verify_<runId>_<n>+clerk_test@example.com`, new per run, so sign-up never collides.
- **Phones.** Any US number from 555-0100 to 555-0199 is a test number. Type it as ten digits, for example `5555550142`. The numbers are shared across repos, CI, and agents, so get one from `host.seedUser({ instance, phone: true })` instead of picking one by hand.
- **One-time code.** `424242` verifies every email code and SMS code for test addresses and phones. Specs use the constant `CLERK_TEST_CODE`. It is public, so it is not an e2e secret, and screenshots after the fill are kept.
- **Passwords.** `with-email-codes` (the `all-enabled` instance) requires a password at sign-up. Use a throwaway per run, such as `Verify-<runId>-Pw1!`.
- **Authenticator (TOTP) codes.** Read the setup key from the MFA setup screen, then compute the 6-digit code with RFC 6238 (SHA-1, 30 second step).

| Instance key in `integration/.keys.json`        | Use it for                                                                                                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `with-email-codes` (the `all-enabled` instance) | Every auth method and every signed-in feature: email code, email link, phone code, password, username, TOTP, backup codes, organizations, social buttons. |
| `with-session-tasks-setup-mfa`                  | Sign-ins that must stop on the "set up MFA" session task. MFA is required for every user there.                                                           |
| `with-session-tasks`                            | Sign-ins that must stop on the "choose or create an organization" session task.                                                                           |

| Step                                        | Native AuthView (iOS identifier)                 | Custom flow (fixture testID)                                           |
| ------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Email field                                 | `clerk.auth.start.identifier`                    | `verify.customSignIn.emailAddress`, `verify.customSignUp.emailAddress` |
| Switch between email and phone              | `clerk.auth.start.identifierSwitcher`            | none                                                                   |
| Phone field                                 | `clerk.auth.start.phoneNumber`                   | none                                                                   |
| Continue or send code                       | `clerk.auth.start.continue`                      | `verify.customSignIn.sendCode`, `verify.customSignUp.sendCode`         |
| Try another method on the email link screen | the `Use another method` text                    | none                                                                   |
| Pick a method from the list                 | `clerk.auth.signIn.alternativeMethod.<strategy>` | none                                                                   |
| Sign-in code field                          | `clerk.auth.signIn.code`                         | `verify.customSignIn.code`, then `verify.customSignIn.verifyCode`      |
| Sign-up password                            | `clerk.auth.signUp.password`                     | `verify.customSignUp.password`                                         |
| Sign-up code field                          | `clerk.auth.signUp.code`                         | `verify.customSignUp.code`, then `verify.customSignUp.verifyCode`      |
| Close AuthView                              | `clerk.dismissButton`                            | none                                                                   |

Prove the result from the host's state, not from the screen alone:

```ts
import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';

test('useSignIn completes with the email code', { tags: ['form-entry'] }, async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  await host.launch({ instance: 'with-email-codes', screen: 'customSignIn' });
  await host.fill(screen.getByTestId('verify.customSignIn.emailAddress'), user.email);
  await host.tap(screen.getByTestId('verify.customSignIn.sendCode'));
  await host.fill(screen.getByTestId('verify.customSignIn.code'), CLERK_TEST_CODE);
  await host.tap(screen.getByTestId('verify.customSignIn.verifyCode'));
  const state = await host.waitForState(s => s.signedIn);
  expect(state.userId).toBe(user.id);
});
```

On `with-email-codes` an AuthView email sign-in starts on the email-link screen, so the spec switches to the email code through `Use another method`. The custom flows call `signIn.emailCode` and `signUp` directly and need no switch.

Rules:

- Type only `+clerk_test` emails, 555-0100 to 0199 phones, and `424242`. Never a real person's address, number, or password. The repo is public, and every video lands on a PR.
- Use ticket sign-in (`host.launch({ signedInAs })`) only to reach signed-in screens for features that are not about authentication. A change to an auth method gets a spec that drives the real form.
- Tag every spec that types a code `form-entry`. Those specs run by default. An agent runtime that refuses to type codes into an app that talks to hosted Clerk runs `bin/verify run --skip form-entry`, which reports them as `skipped by --skip form-entry`, and says so in the PR. Each auth feature has a `request-code` spec that proves the flow up to its code screen without typing a code. CI runs the skipped specs.
- The form-entry specs, one command each: `bin/verify run native-auth-view/complete`, `bin/verify run custom-flow-sign-in/complete`, and `bin/verify run custom-flow-sign-up/complete`.
- `bin/verify down` deletes every user the run created, including users created through the sign-up form, by their test email.

## Evidence

Every `run` writes `.verify/runs/<run-id>/` and prints its path:

| File                      | What it is                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run.json`                | The sealed record: `results` per spec, `platform`, `gitHead`, `dirty`, `build` (the build key), `device`, `identities`, and `tainted` files                                                          |
| `video.mp4`               | `simctl io recordVideo` on iOS, or `adb shell screenrecord --size 720x1608` on Android, of the whole run                                                                                             |
| `screenshots/<label>.png` | Every `host.screenshot(label)`                                                                                                                                                                       |
| `states.jsonl`            | Every `VerifyState` the fixture read, in order, across every test in the run                                                                                                                         |
| `state.json`              | Only the last state of the whole run. With several tests, read per-test states from `states.jsonl` by `launchId`                                                                                     |
| `app.log`                 | Native log lines from the device for the run. In a Debug dev client the JS console goes to Metro, so the `[verify]` and `[verify:network]` lines are in `.verify/runtime/metro-<port>.log`, not here |
| `e2e/`                    | e2e's `report.json`, failure pages, and `screen.txt` for failed steps                                                                                                                                |
| `e2e.log`                 | e2e's console output                                                                                                                                                                                 |
| `specs/`                  | A copy of every spec the run used                                                                                                                                                                    |

Proof standards: drive the real user path, capture the action and the resulting state (the video plus `states.jsonl`), and check side effects in `states.jsonl` (`userId`, `sessionId`, `signInStatus`), not only the final screen.

After a run, sealing searches the run directory for every secret the run used (secret keys, tickets). A hit marks the file tainted in `run.json`, and a tainted run cannot be attached.

```console
$ bin/verify attach <run-id> --pr <n>                       # video and every screenshot
$ bin/verify attach <run-id> --pr <n> --screenshot profile  # video and one screenshot
```

`attach` posts once per run with `gh pr comment --repo clerk/javascript --attach`. It refuses a run that is tainted, failed, or shows a user id the run did not create.

## Cleanup

```console
$ bin/verify down --dry-run                 # what it would release, delete, and stop
$ bin/verify down                           # both platforms: release the lanes, delete run users, stop Metro, the watch build, recorders, and the agent-device daemon
$ bin/verify down --platform android        # one platform's lane only
$ bin/verify down --stale                   # also finish cleanup left by a crashed run in this worktree
```

`down` deletes only what this worktree created: its lane devices, the users in its ledger, and the processes in its ledger. Ledgers live at `~/.verify/ledgers/<id>.jsonl`, where `<id>` is a hash of the worktree path. It never deletes `.verify/runs/`. Evidence survives teardown at `packages/expo/.claude/skills/verify/.verify/runs/<run-id>/`, and `down` lists the kept runs. Run `down` after a failed iteration too, so no device or Metro is stranded.

`down` leaves the fixture's generated files (`package.json`, `node_modules/`, `ios/`, `android/` in `integration/templates/expo-native`) in place, so the next `up` reuses them. They are gitignored.

Evidence lives inside the worktree, so `git worktree remove` deletes `.verify/runs/` with it. Copy the runs you need out first.

## Helpers

- `bin/verify` is the only helper. It is executable. Every invocation is shown above.
- `e2e.config.ts` composes the e2e config from the CLI's run context. `npx e2e list` works from this directory while a lease is held.
- `specs/fixtures.ts` is the `host` fixture, the same file as in clerk-ios and clerk-android. `specs/native.ts` holds this repo's per-platform locators for native views.
- `src/host.ts` is the only Expo-specific module: the fixture build, the native-input list, Metro ports, and the dev-client entry. `src/core/` and `src/platform/` are shared with clerk-ios and clerk-android. Change `src/core/` in clerk-ios first, then copy it here.
- `npm test` runs the CLI's unit tests (`node --test test/*.test.ts`), with no network, keys, or devices. `testing/` holds helper processes those tests spawn. `npm run typecheck` runs `tsc`.
- `features/` is the Feature Map. Start with `features/README.md`.

Keep the map honest with `/maintain-verification-skill`.
