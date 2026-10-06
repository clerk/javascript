---
name: verify-clerk-expo
description: Drive @clerk/expo in the expo-native fixture app (native AuthView, UserButton, UserProfileView, custom useSignIn and useSignUp flows, token cache) on an iOS simulator or Android emulator against a real Clerk development instance that the session creates and deletes, and capture video, screenshots, and app state as evidence. The device is a simulator or emulator on this Mac. Use it to prove any change to packages/expo or the fixture works before calling it done, to reproduce a UI bug, or to run the golden regression specs.
---

# verify-clerk-expo

`.claude/skills/verify-clerk-expo/bin/control-clerk-expo` is a control CLI over [e2e](https://github.com/tester-army/e2e) 0.15.2 and `@e2e-dev/mobile` 0.9.0. It builds the `expo-native` fixture in `integration/templates/expo-native`, leases a simulator or emulator, creates one Clerk application for the worktree, seeds `+clerk_test` users, runs specs, and keeps the evidence. The device is local, the fixture is a Debug dev client, and Metro serves your working tree to it. The skill needs a Mac: on any other machine `doctor`, `up`, and `run` fail with `UNSUPPORTED`.

No change to `@clerk/expo` UI or auth behavior is done until a `run` on the real fixture shows the changed behavior, on each platform the change touches.

Run every command from the repo root. In the prose below, `doctor`, `up`, `run`, `screen`, `attach`, and `down` are verbs of that CLI. Paths that begin `specs/`, `features/`, `references/`, `src/`, `test/`, or `.verify/` are inside `.claude/skills/verify-clerk-expo/`. Every verb but `attach` takes `--platform ios|android`, and iOS is the default. Every verb takes `--json` and then prints one `{ "ok": ... }` object. Exit codes are 0 for success, 1 for a failing spec, 2 for a usage error, and 3 for a failed precondition. Every error prints a `fix` line.

CI runs none of these specs. The `Verify Skill Tests` job in `.github/workflows/ci.yml` runs the skill's unit tests and `tsc`. The device tests that gate a pull request are `integration/tests/expo-native/*.e2e.ts`, which `.github/workflows/expo-native-build.yml` runs against a Release build of the same fixture with the same `e2e` engine. This skill is the development loop, and a regression test that must run on every pull request belongs in `integration/tests/expo-native/`.

The fixture links `@clerk/expo`, `@clerk/expo-biometrics`, and `@clerk/expo-google-signin` from the workspace. It does not install `@clerk/expo-passkeys`, so the skill cannot verify passkeys.

## Launch

Set up each machine once.

1. Install Node 24. For iOS, install Xcode with an iOS simulator runtime. For Android, install Android Studio with the SDK, the emulator, and Java 21. The CLI looks for the SDK in `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `~/Library/Android/sdk`.
2. Create the iOS template simulator, which the CLI clones to make each simulator it drives, for example with `xcrun simctl clone "iPhone Air" "Clerk Verify Template iOS"`. If this Mac sends HTTPS through a debugging proxy, boot the template once, install and trust the proxy's CA in it, and shut it down. Android needs no template: the first `up --platform android` writes the `Clerk_Verify_Pixel` AVD.
3. Give the machine the team's Clerk Platform API key. Set `CLERK_PLATFORM_API_KEY`, or set `CLERK_PLATFORM_API_KEY_FILE` to a file that only you can read (mode 0600). To keep the key in 1Password instead, install the 1Password CLI, turn on its desktop app integration, and put the key's secret reference in `VERIFY_PLATFORM_KEY_REFERENCE` or as the one line of `~/.verify/clerk-platform-key-reference`. The reference has the shape `op://<vault>/<item>/credential`, and the team's private setup note has the real one. Never put the key or the reference in a file inside a repository.

Then, in each worktree:

```console
$ pnpm install                                                              # once per worktree
$ npm ci --prefix .claude/skills/verify-clerk-expo                          # once per worktree
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo up --platform ios
instance creating verify-throwaway-until-<utc>-<hex> in org_3KHungJxbvIscuSvy8oos5MHAli
build   <build key>  local  building...
build   turbo build @clerk/expo, @clerk/expo-biometrics, @clerk/expo-google-signin
instance <application>  up in 0.8s on standard, 212 settings match src/core/instances/base.json
build   expo prebuild --clean --platform ios
build   xcodebuild Debug (dev client)
build   <build key>  local  built in 123s
device  verify-ios-2  cloning Clerk Verify Template iOS
install <build key>  on verify-ios-2
watch   packages/expo  tsdown --watch (pid <pid>)
metro   :8083  expo start (pid <pid>)
metro   :8083  bundling ios once so the first launch does not wait on Metro
device  verify-ios-2  local  leased by this worktree  installed <build key>
```

The skill is outside the pnpm workspace, so `npm ci` installs its pinned `e2e` and `agent-device` from the skill's own lockfile. The sample is the first `up` in a worktree, without its `instances` and `clerk` lines. The lane is ready when `up` prints the `device` line that ends in `installed <build key>`, which is its last line. `run` does the same steps itself, so `up` only starts the slow part early. Teardown is `down` (see [Cleanup](#cleanup)).

`up` does four things:

- It builds the dev client when no build matches the native inputs: `turbo build` for the three packages, `expo prebuild --clean`, then `xcodebuild` or `gradlew assembleDebug`. The build overwrites the fixture's generated `package.json`, `ios/`, and `android/`. A change to anything else reuses the build and prints `build <key> local reused`.
- It creates this worktree's Clerk application through Clerk's Platform API, in the team's verification workspace, and puts its development instance on the standard settings in `src/core/instances/base.json`. The application holds only the users that this worktree's runs create, and `down` deletes it. [Test instances](references/instances.md) has the credential lookup, the application's lifetime, and its limits.
- It leases a lane and installs the build. An iOS lane is a clone of the template named `verify-ios-<n>`. An Android lane boots `Clerk_Verify_Pixel` read-only as `emulator-5560` or `emulator-5562`.
- It starts `tsdown --watch` in `packages/expo` (the watch build) and `expo start` on the lane's Metro port.

`up` is idempotent. It keeps a lease that this worktree already holds. A failed `up` stops the Metro and the watch build that it started.

A JS change reaches the app with no build. Before the specs start, `run` waits until the watch build has caught up and Metro serves the current code, and it fails with `NOT_READY` and the path of the Metro log when Metro never does. [How a change reaches the app](references/freshness.md) has the native inputs, the checks, the ports, and the logs. It also says what to do after a change to another workspace package, such as `@clerk/clerk-js` or `@clerk/shared`. While Metro runs, never run `pnpm --filter @clerk/expo build` or a build of a package that `@clerk/expo` depends on, because the build deletes the `dist` that Metro serves.

A worktree can hold one lane of each platform. The two lanes share the watch build and the application, and each has its own Metro. Start their runs one after the other, for two reasons. A `run` that finds an edited sibling package stops every Metro of the worktree while it rebuilds the package, including the Metro that a run on the other platform is using. And while both platforms ran specs on the shared application at the same time, a ticket sign-in failed with `resource_not_found` in two of four tries, which never happened with one run at a time.

A Mac has four iOS lanes and two Android lanes, shared by every worktree on it. When all are taken, `up` and `run` fail with `POOL_FULL`, and `--wait <seconds>` on either verb waits for a lane. Never drive a simulator or emulator that the CLI did not create, the template, a physical device, or a lane that another worktree holds. [Local devices](references/devices.md) says how to find a lane's UDID or serial.

With the key in 1Password, a command that needs it prints `wait    reading the team key from 1Password; approve the request in the 1Password app within 60s`, and the 1Password app asks the person at the Mac to approve. An agent cannot approve the request, so tell the person before the first command.

## Doctor

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform android
```

Run it first, and again whenever anything looks off. Without `--live` it only reads. It creates no file, no device, and no Clerk application. Each line starts with `ok`, `warn`, `skip`, or `FAIL`, then has the id of the check and what the check found. `skip` marks a check that did not run, and its text starts with `not run:`. A failing check also prints a `fix:` line with the command to run, and `doctor` exits 3. A warning does not change the exit code.

| Checks                                           | Pass when                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`, `e2e-pins`                               | Node is 24.x, and the installed `e2e` and `@e2e-dev/mobile` are the versions that `package.json` pins. `e2e-pins` fails until `npm ci` has run in this worktree                                                                                           |
| `xcode`, `template`, `proxy-trust`, `lane-ports` | iOS: `xcodebuild` runs. `Clerk Verify Template iOS` exists and is shut down. It trusts a custom CA if macOS has a system HTTPS proxy. Every booted `verify-ios-<n>` simulator has a live claim                                                            |
| `jdk`, `template`, `lane-ports`                  | Android: a Java 21 is found. The SDK's emulator and adb run. Ports 5560 to 5562 hold only lanes that the CLI booted                                                                                                                                       |
| `instances`, `clerk-api`, `settings`             | A Platform API credential reaches the verification workspace. Clerk's Backend API accepts the secret key of the application this worktree holds. That application shows the settings recorded for it, and every declaration under `specs/` is well formed |
| `build`                                          | A build of the fixture matches the current tree                                                                                                                                                                                                           |
| `gh-attach`                                      | `gh pr comment` has `--attach`. A `gh` without it prints `warn` and not `FAIL`, because only `attach` needs it                                                                                                                                            |
| `stale-claims`, `agent-device-daemon`            | No lane is claimed by a worktree that no longer exists, and no agent-device daemon runs from an install that was deleted                                                                                                                                  |
| `feature-map`, `core-drift`                      | Every feature in `src/host.ts` has a feature file and a golden spec, and `src/core/` matches `src/core/MANIFEST`                                                                                                                                          |

After the once-per-machine setup and before the first `up`, `build` is the one failing check, and its fix is the `up` command for that platform. A machine with no Platform API credential fails `instances`, and the fix line says how to supply one. `doctor --live` also proves that the credential can do the work. It creates one application, configures it, compares it with the standard file, and deletes it, and reports that in a `live-instance` line. When this worktree already holds an application, `doctor --live` creates nothing, and the `live-instance` line is a `skip`.

## Drive

Input reaches the app only through specs. A spec is a TypeScript file that uses the `host` fixture from `specs/fixtures.ts` and e2e's `screen` locators.

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run native-auth-view --platform ios          # one feature: every spec in specs/golden/native-auth-view/
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-in/request-code         # one golden spec, on iOS
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run specs/explored/<name>.e2e.ts             # a spec you wrote
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run native-auth-view native-js-sync          # several targets in one run, with one video
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run --all --skip form-entry --platform android  # every golden spec except the ones that type a code or a password
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo screen --platform ios                        # the UI tree that is on screen now; --png adds a screenshot
```

`run` also takes `--grep <regex>`, `--no-video`, and `--wait <seconds>`. The wait covers a free lane and another `run` in this worktree that holds the device. A golden spec tagged `known-bug` reproduces an open bug, and `run` leaves it out unless you pass `--include known-bug`. Today that is the AuthView dismiss test in `native-auth-view/opens`. A spec limited to one platform with `test(title, { platforms: ['ios'] }, fn)` reports as skipped on the other.

For a JS change, edit the source and `run` the spec, with no `up` in between. For a change to a native input, the same `run` rebuilds the dev client first.

### Sign in with the form or with a ticket

A change that touches sign-in or sign-up gets a spec that drives the real form with a `+clerk_test` identity and the test code. Any other change reaches a signed-in state with a sign-in ticket, `host.launch({ signedInAs: user })`, which is the intended shortcut and not a fallback. A runtime that cannot type codes into the app skips the typing specs with `--skip form-entry` on `run` and says so in the PR.

Tag every spec that types a code or a password `form-entry`. Four golden specs carry the tag: `custom-flow-sign-in/complete`, `custom-flow-sign-up/request-code`, `custom-flow-sign-up/complete`, and `native-auth-view/complete`. `run` reports a skipped one as `skipped by --skip form-entry`. Never report it as verified through a ticket launch. With the flag, `custom-flow-sign-in/request-code` and `native-auth-view/request-code` still run and prove their flow up to the code screen. Sign-up has no spec that runs without typing a password, so a run with the flag leaves sign-up unproven.

Type only test identities: `+clerk_test` emails and the code `424242`, which specs import as `CLERK_TEST_CODE`. Never type a real person's address or password. The repository is public, and a run's video can land on a PR. [The feature map index](features/README.md) lists the test identities and the identifier for each step of the forms.

### Write a spec

```ts
import { test, expect } from '../../fixtures.ts';
import { nativeProfile } from '../../native.ts';

test('the native UserProfileView shows the seeded user', async ({ host, screen }) => {
  const user = await host.seedUser();
  const state = await host.launch({ signedInAs: user, screen: 'userProfile' });
  expect(state.userId).toBe(user.id);
  expect(state.sessionStatus).toBe('active');
  await host.tap(nativeProfile(screen).manageAccount);
  await expect(screen.getByText(user.email)).toBeVisible({ timeout: 20_000 });
  await host.screenshot('profile');
});
```

- `host.seedUser({ phone? })` creates a `+clerk_test` user in the worktree's application. `host.newEmail()` reserves an address for a sign-up through the form.
- `host.launch({ signedInAs?, screen?, authMode?, debugLogs?, keepStorage? })` relaunches the fixture and returns the first ready `VerifyState` of that launch. Screens are `home`, `auth` (AuthView with no close button), `nativeAuth` (AuthView with a close button), `userButton`, `userProfile`, `customSignIn`, `customSignUp`, and `tokenCache`. Auth modes are `signIn`, `signUp`, and `signInOrUp`. A launch starts with fresh storage unless `keepStorage` is true, so a launch with no `signedInAs` is signed out. A new screen goes in `verify/launch.ts` and `verify/VerifyHost.tsx` of the fixture, and in `SCREENS` in `src/host.ts`.
- `host.state()` reads the state footer, and `host.waitForState(predicate, timeoutMs?)` polls it.
- `host.tap(locator)` taps the middle of a node, and `host.fill(locator, text)` taps it and types. Use them inside the native views. agent-device reports a SwiftUI view inside the React Native host as covered by another element and refuses a plain `locator.tap()` or `locator.fill()` there.
- `host.screenshot(label)` writes `screenshots/<label>.png` in the run directory.

The fixture shows its state in a footer with the testID `verify.state`. The footer holds the word `verify` and one line of JSON. [The feature map index](features/README.md) lists its fields. `screen` is what is on screen, not what the launch asked for. `signedIn` is true for a pending session, so read `sessionStatus`.

On iOS, locate nodes of the native views with the SDK's identifiers, such as `screen.getByTestId('clerk.auth.start.identifier')`. The clerk-android release that `@clerk/expo` pins has no test tags, so `specs/native.ts` finds the Android native views by text. The fixture's own screens have `verify.*` testIDs on both platforms. All of these identifiers are internal test hooks, not public API, and they can change. Every spec keeps at least one exact assertion on `verify.state` or on an identifier.

A spec file that needs other settings than the standard ones exports them once, right after its imports, as a plain literal. `run` puts the application on those settings before the tests in that file start. No golden spec declares any today. [Test instances](references/instances.md) has the rules for a declaration.

### Check your work

Golden specs under `specs/golden/<feature>/` are committed and cover the feature map in `features/`. Run the features your change touches, on both platforms when the change is not specific to one. For new work:

1. Write a spec under `specs/explored/`, which is gitignored. It imports the fixture as `'../fixtures.ts'`.
2. Run it by path.
3. Run `screen` after the run, pass or fail. It prints the tree that the app is on now, with each node's role, label, and testID, and a `state` line.
4. Fix the locators from that output until the spec passes.
5. When the change adds or changes user-facing behavior, move the spec to `specs/golden/<feature>/`, change its import to `'../../fixtures.ts'`, `git add` it, and update the feature file. Otherwise leave it where it is. The run directory keeps a copy of every spec the run used.

A failing spec prints `FAIL`, the first assertion message, and the path of its failure page, and `run` exits 1. The failure page (`.verify/runs/<run-id>/e2e/failures/*.md`) lists every step, the screen tree at the failure, and a screenshot. A run in which no test executed, such as a `--grep` that matches nothing, fails with `NO_SPECS` and exits 3, because it proved nothing.

## Evidence

Every `run` writes `.verify/runs/<run-id>/` and prints its path.

| File                      | What it holds                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run.json`                | The sealed record: `results` per spec, `platform`, `backend`, `gitHead`, `dirty`, `build`, `device`, `identities`, `instances`, `settings`, and `tainted`                           |
| `video.mp4`               | The whole run, from `simctl io recordVideo` on iOS or `adb shell screenrecord` on Android                                                                                           |
| `screenshots/<label>.png` | Every `host.screenshot(label)`                                                                                                                                                      |
| `states.jsonl`            | Every `VerifyState` the fixture read, in order, across every test in the run                                                                                                        |
| `state.json`              | The last state of the run only. Read the states of one test from `states.jsonl` by `launchId`                                                                                       |
| `app.log`                 | Device log lines. On Android they include the app's `[verify]` console lines. On iOS they are native lines only, and the `[verify]` lines are in `.verify/runtime/metro-<port>.log` |
| `e2e/`, `e2e.log`         | e2e's `report.json`, its failure pages, and its console output                                                                                                                      |
| `specs/`                  | A copy of every spec the run used                                                                                                                                                   |

A proof drives the real user path. It captures the action and the resulting state, which the video and `states.jsonl` give you. It checks side effects in `states.jsonl` (`userId`, `sessionId`, `signInStatus`), not only the final screen. To prove a JS change, find the change's own console line in this run's part of the Metro log. [How a change reaches the app](references/freshness.md) says where that part starts and ends.

After a run, the CLI searches the run directory for every secret the run used: the Platform API key, the instance's secret key, and sign-in tickets. A hit marks the file as tainted in `run.json`.

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo attach <run-id> --pr <n>                       # the video and every screenshot
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo attach <run-id> --pr <n> --screenshot profile  # the video and one screenshot
```

`attach` posts one comment per run and PR with `gh pr comment --attach`. It needs a `gh` whose `gh pr comment` has that flag, and it fails with a fix when the flag is missing. It refuses a run that is tainted, that has a failing spec or no passing one, or that shows a user id the run did not create.

Attach the focused run, not the regression run. Run your new or changed spec on its own and attach that run, so the PR video shows only the behavior the change is about. Run the golden specs for every feature you touched in a separate `run`, cite its run id in the PR as regression evidence, and leave its video in `.verify/runs/`.

## Cleanup

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo down --dry-run          # what it would release, delete, and stop
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo down                    # both platforms
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo down --platform ios     # one platform, when the other stays leased
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo down --stale            # also release a lane that a crashed run here, or a deleted worktree, left claimed
```

`down` removes only what this worktree created: its lanes, its Clerk application with every user in it, its Metro processes, the watch build, the video recorder, and its agent-device daemon. Deleting the application needs the same credential as `up`. Run `down` after a failed iteration too, so that no device, Metro, or application stays behind.

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo down
clerk   Platform API: 4 requests by this command so far, 1 application deleted
released  verify-ios-1, verify-android-1 (emulator-5560)
deleted   1 application (<application>, with every test user in it)
stopped   watch <pid>, agent-device <pid>, metro <pid>, metro <pid>
kept      80 runs in .verify/runs/
```

That `down` released a lane of each platform.

While the other platform stays leased, `down --platform <p>` releases that platform's lane and stops its Metro. It keeps the application, the watch build, and the agent-device daemon, which the other lane still uses, and it prints `kept    this worktree's throwaway instances, which its <platform> lease still uses`.

`down` never deletes `.verify/runs/`, and it prints how many runs it kept. Evidence lives inside the worktree, so `git worktree remove` deletes it with the rest. Copy the runs you need out first. `down` leaves the fixture's generated files in `integration/templates/expo-native`, which are gitignored, so the next `up` reuses them.

If a worktree is removed without `down`, the next `up` or `run` in any worktree on the same Mac finishes for it, and prints a `reap` line for each lane and ledger it cleans up.

## Helpers

- `bin/control-clerk-expo` is the CLI. It is executable, and every verb is shown above.
- `npm test --prefix .claude/skills/verify-clerk-expo` runs the CLI's unit tests, with no network, key, or device. `npm run typecheck --prefix .claude/skills/verify-clerk-expo` runs `tsc`. The `Verify Skill Tests` job in `.github/workflows/ci.yml` runs both on Linux when a pull request changes the skill, the fixture, or a package the fixture links.
- `src/core/`, `src/platform/ios/`, `src/platform/android/`, `specs/fixtures.ts`, `testing/`, and every test but `test/host.test.ts` and `test/freshness.test.ts` are shared with the clerk-ios and clerk-android verification skills. Change them there first, then copy them here, and never edit them here. `doctor`'s `core-drift` check fails when a file under `src/core/` differs from `src/core/MANIFEST`. Do not rewrite the manifest here to make it pass.
- `src/host.ts`, `src/fixture.ts`, and `src/freshness.ts` are this repository's own: the screens, the build of the fixture, the Metro ports, and the check that Metro serves current JS. `specs/native.ts` holds the per-platform locators for the native views.
- To call `agent-device` yourself, use `node_modules/.bin/agent-device` in the skill directory with `AGENT_DEVICE_STATE_DIR=.claude/skills/verify-clerk-expo/.verify/agent-device`. Each worktree runs its own daemon from there, and `down` stops it. Never print `.verify/agent-device/daemon.json`, because it holds the daemon's auth token.
- `features/` is the feature map. Start with `features/README.md`, and update a feature file in the same PR as a change to the behavior it maps.

The skill's files are in `.claude/skills/verify-clerk-expo/`. `.cursor/skills/verify-clerk-expo` is a symlink to that directory, so edit only the `.claude` copy.
