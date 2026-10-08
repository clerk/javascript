---
name: verify-clerk-expo
description: Drive @clerk/expo in the expo-native test app (native AuthView, UserButton, UserProfileView, custom useSignIn and useSignUp flows, token cache, the Google and biometrics native modules) on an iOS simulator or Android emulator against a real Clerk development instance that the session creates and deletes, and capture video, screenshots, and the app log as evidence. Use it to prove any change to packages/expo or the test app works before calling it done, to reproduce a UI bug, or to run the golden regression specs.
---

# verify-clerk-expo

`.claude/skills/verify-clerk-expo/bin/control-clerk-expo` is a control CLI over [e2e](https://github.com/tester-army/e2e) 0.18.0 and `@e2e-dev/mobile` 0.10.0. It builds the `expo-native` test app in `integration/templates/expo-native`, leases a simulator or emulator, creates one Clerk application for the worktree, seeds `+clerk_test` users, runs specs, and keeps the evidence. The test app is a Debug dev client, and Metro serves your working tree to it.

No change to `@clerk/expo` UI or auth behavior is done until a `run` on the real test app shows the changed behavior, on each platform the change touches.

Run every command from the repo root. In the prose below, `doctor`, `up`, `run`, `screen`, `attach`, and `down` are verbs of that CLI. Paths that begin `specs/`, `features/`, `references/`, `src/`, `test/`, or `.verify/` are inside `.claude/skills/verify-clerk-expo/`. Every verb but `attach` takes `--platform ios|android`, and iOS is the default. Every verb takes `--json` and then prints one `{ "ok": ... }` object. Exit codes are 0 for success, 1 for a failing spec, 2 for a usage error, and 3 for a failed precondition. Every error prints a `fix` line.

CI runs none of these specs. A regression test that must run on every pull request belongs in `integration/tests/expo-native/`, which `.github/workflows/expo-native-build.yml` runs against a Release build of the same test app with the same `e2e` engine.

The test app links `@clerk/expo`, `@clerk/expo-biometrics`, and `@clerk/expo-google-signin` from the workspace. It does not install `@clerk/expo-passkeys`, so the skill cannot verify passkeys.

## Launch

Set up each machine once.

1. Install Node 24, at 24.8.0 or newer. For a local iOS device, install Xcode with an iOS simulator runtime. For a local Android device, install Android Studio with the SDK, the emulator, and Java 21. The CLI looks for the SDK in `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `~/Library/Android/sdk`.
2. Create the iOS template simulator, which the CLI clones to make each simulator it drives, for example with `xcrun simctl clone "iPhone Air" "Clerk Verify Template iOS"`. Android needs no template: the first `up --platform android` writes the `Clerk_Verify_Pixel` AVD.
3. Give the machine the team's Clerk Platform API key. Set `CLERK_PLATFORM_API_KEY` to the key. Or set `CLERK_PLATFORM_API_KEY_FILE` to a file that holds it and that only you can read (mode 0600). Or set `VERIFY_PLATFORM_KEY_REFERENCE` to the key's 1Password secret reference, which the 1Password CLI reads once a person approves the request in the 1Password app, within 60 seconds. Never put the key or the reference in a file inside a repository.

Then, in each worktree:

```console
$ pnpm install                                                              # once per worktree
$ npm ci --prefix .claude/skills/verify-clerk-expo                          # once per worktree
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo up --platform ios
backend local  this Mac runs the simulator itself
instance creating verify-throwaway-until-<utc>-<hex> in org_3KHungJxbvIscuSvy8oos5MHAli
build   <build key>  local  building...
build   turbo build @clerk/expo, @clerk/expo-biometrics, @clerk/expo-google-signin
instance <application>  up in 0.7s on standard, 62 settings match src/core/instances/base.json
build   expo prebuild --clean --platform ios
build   xcodebuild Debug (dev client)
build   <build key>  local  built in 110s
device  verify-ios-1  cloning Clerk Verify Template iOS
install <build key>  on verify-ios-1
watch   packages/expo  tsdown --watch (pid <pid>)
metro   :8082  expo start (pid <pid>)
metro   :8082  bundling ios once so the first launch does not wait on Metro
device  verify-ios-1  local  leased by this worktree  installed <build key>
```

The skill is outside the pnpm workspace, so `npm ci` installs its pinned `e2e` and `agent-device` from the skill's own lockfile. The sample is the first `up` in a worktree, without its `instances` and `clerk` lines. The device is ready when `up` prints the `device` line that ends in `installed <build key>`, which is its last line. `run` does the same steps itself, so `up` only starts the slow part early. Teardown is `down` (see [Cleanup](#cleanup)).

`up` does four things:

- It builds the dev client when no build matches the native inputs: `turbo build` for the three packages, `expo prebuild --clean`, then `xcodebuild` or `gradlew assembleDebug`. The build overwrites the test app's generated `package.json`, `ios/`, and `android/`. A change to anything else reuses the build and prints `build <key> local reused`.
- It creates this worktree's Clerk application through Clerk's Platform API, in the team's verification workspace, and puts its development instance on the standard settings in `src/core/instances/base.json`. The application holds only the users that this worktree's runs create, and `down` deletes it. [Test instances](references/instances.md) has the credential lookup, the application's lifetime, and its limits.
- It leases a lane, which is a simulator or emulator that the CLI creates, and installs the build.
- It starts `tsdown --watch` in `packages/expo` (the watch build) and `expo start` on the lane's Metro port.

`up` is idempotent. It keeps a lease that this worktree already holds. A failed `up` stops the Metro and the watch build that it started.

On a local device a JS change reaches the app with no build. Before the specs start, `run` waits until the watch build has caught up and Metro serves the current code, and it fails with `NOT_READY` and the path of the Metro log when Metro never does. [How a change reaches the app](references/freshness.md) has the native inputs, the checks, the ports, and the logs. It also says what to do after a change to another workspace package, such as `@clerk/clerk-js` or `@clerk/shared`. While Metro runs, never run `pnpm --filter @clerk/expo build` or a build of a package that `@clerk/expo` depends on, because the build deletes the `dist` that Metro serves.

A worktree can hold one lane of each platform. The two lanes share the watch build and the application, and each has its own Metro. Run them one after the other. The application serves one run at a time, because a run can change its settings. A `run` that starts while a run on the other platform is driving leases its device and then fails with `DEVICE_BUSY`, and its fix is to let that run finish and rerun.

A Mac has four iOS lanes and two Android lanes, shared by every worktree on it. When all are taken, `up` and `run` fail with `POOL_FULL`, and `--wait <seconds>` on either verb waits for a lane. The CLI drives only the simulators and emulators that it creates. [Local devices](references/devices.md) says how to find a lane's UDID or serial.

The test app is built locally on macOS only. On a Linux machine that can run the emulator, the CLI picks the local backend for Android, and the build then fails with `UNSUPPORTED`.

## Doctor

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform ios
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo doctor --platform android
```

Run it first, and again whenever anything looks off. Without `--live` it only reads. It creates no file, no device, and no Clerk application. Each line starts with `ok`, `warn`, `skip`, or `FAIL`, then has the id of the check and what the check found. `skip` marks a check that did not run, and its text starts with `not run:`. A failing check also prints a `fix:` line with the command to run, and `doctor` exits 3. A warning does not change the exit code.

After the once-per-machine setup and before the first `up`, `build` is the one failing check, and its fix is the `up` command for that platform. A machine with no Platform API credential fails `instances`, and the fix line says how to supply one. `doctor --live` also creates one application, configures it, compares it with the standard settings, and deletes it, which proves that the credential can do each.

## Drive

Input reaches the app only through specs. A spec is a TypeScript file that uses the `host` fixture from `specs/fixtures.ts` and e2e's `screen` locators.

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run native-auth-view --platform ios          # one feature: every spec in specs/golden/native-auth-view/
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run custom-flow-sign-in/complete             # one golden spec, on iOS
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run specs/explored/<name>.e2e.ts             # a spec you wrote
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo run native-auth-view native-js-sync          # several targets in one run, with one video
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo screen --platform ios                        # the UI tree that is on screen now; --png adds a screenshot
```

`run` also takes `--grep <regex>`, `--retries <n>`, `--no-video`, and `--wait <seconds>`. `--retries <n>` runs a failed test again, up to `n` more times. The default is 0, so a run of your own change shows exactly what happened. The wait covers a free lane and another `run` in this worktree that holds the device. A spec limited to one platform with `test(title, { platforms: ['ios'] }, fn)` reports as skipped on the other.

For a JS change on a local device, edit the source and `run` the spec, with no `up` in between. For a change to a native input, the same `run` rebuilds the dev client first.

### Sign in with the form or with a ticket

A change that touches sign-in or sign-up gets a spec that drives the real form with a `+clerk_test` identity and the test code. Any other change reaches a signed-in state with a sign-in ticket, `host.launch({ signedInAs: user })`.

Type only test identities: `+clerk_test` emails, phone numbers 555-0100 to 555-0199, and the code `424242`, which specs import as `CLERK_TEST_CODE`. [The feature map index](features/README.md) lists the test identities and the identifier for each step of the forms.

### Write a spec

```ts
import { test, expect } from '../../fixtures.ts';
import { nativeProfile, nativeUserButton } from '../../native.ts';

test('the home UserButton opens the profile of the signed-in user', async ({ host, screen, platform }) => {
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await host.tap(nativeUserButton(screen, platform));
  await host.tap(nativeProfile(screen).manageAccount);
  await expect(screen.getByText(user.email)).toBeVisible({ timeout: 20_000 });
  await host.screenshot('profile');
});
```

- `host.seedUser({ phone?, password? })` creates a `+clerk_test` user in the worktree's application. With `password: true` the user also has a password that the run generated for that user, and `user.password` holds it. Pass it to `host.fill`, as `host.fill(field, user.password!)`, and to nothing else. It prints as `<secret:password>`, `run` redacts its value from the logs it writes, and `attach` refuses a run whose files hold it. `host.newEmail()` reserves an address, and `host.newPhone()` a 555-01xx number, for a sign-up through the form.
- `host.launch({ signedInAs?, authMode?, keepStorage?, landsOn? })` relaunches the test app and waits up to 60 seconds for its home. Every launch opens on the home, and a spec taps from there to the screen it needs, as a user does. `authMode` is the mode of every AuthView the home opens: `signIn`, `signUp`, or `signInOrUp`. A launch starts with fresh storage unless `keepStorage` is true, so a launch with no `signedInAs` is signed out and lands on the home's `Sign in` button. `host.launch()` with no argument is that launch. A launch with `signedInAs` lands on the home, which must show that user's email and user ID. When the home should show anything else, pass its locator as `landsOn`. A launch that keeps storage and has no `signedInAs` needs it. `host.launch` fails at once when the test app shows its error screen, and the error has the message on that screen.
- The home lists a link to each of the test app's other screens. Signed out, it has `Sign in` (`host.app.signIn`, AuthView in a modal), `Sign in with a logo` (the same modal with a React Native logo), `Sign in full screen` (`host.app.signInFullScreen`, AuthView with no close button), `Sign in full screen with a close button`, `Custom sign-in`, `Custom sign-up`, and `Native modules`. Signed in, it has `Embedded profile` (UserProfileView inline). `Token cache` shows in both states. `homeLinks(screen)` in `specs/native.ts` has the locator of each link that `host.app` does not hold. A new screen goes in `screens/destinations.ts` and `verify/VerifyHost.tsx` of the test app and in `homeLinks`.
- `host.expectSignedInAs(user, timeoutMs?)` waits for the home to show `Signed in as <email>`, the user's ID, and a session ID. Pass the email alone for a user that the sign-up form created. `host.expectSignedOut(timeoutMs?)` waits for the home to show `Signed out` with no user ID and no session ID. Use them for the outcome of a flow that returns to the home.
- `host.app` has the locators of the home: `signIn`, `signInFullScreen`, `signedOut`, `signedIn`, `userId`, `sessionId`, `signOut`, and `error` for the error screen. `host.runId` is the id of the run, for a password that must be new in each run.
- `host.tap(locator)` is `locator.tap()` with the assertion timeout, and `host.fill(locator, text)` taps a field and types into it. When the first tap left no field focused, it taps the field once more before it types. Fill the text fields of the native views with `host.fill`. On iOS a native text field shows no text input until it has focus, so a plain `locator.fill()` on it fails with "no text input found at the provided coordinates to clear". After it types, `host.fill` reads the focused text input back. If the input is still empty after two seconds, `host.fill` taps it and types once more, and it fails with "the text never reached the field" if the input is empty again. If the input holds something other than the text, `host.fill` replaces the input's contents with the text once, and it fails with "the field does not hold the typed text" if the input is still wrong. It compares letters and digits only, so the formatting a field adds does not count. A password field withholds its value, so a password is typed once and is not confirmed. On iOS an empty React Native field of the test app reads as its placeholder, which `host.fill` treats as any other value that is not the text.
- `host.screenshot(label)` writes `screenshots/<label>.png` in the run directory.

Assert on what a user sees, and look in the native Clerk views first. The code screen of AuthView names the address the code went to. The profile lists the email of the signed-in user under `Manage account`. Use the test app's own screens for a fact that no native view shows, and for the outcome of a flow that returns to the home.

The home is the test app's own screen in a verify launch. With no active session it shows `Signed out` (`e2e.auth.signedOut`) and a `Sign in` button (`e2e.auth.signIn`) that opens AuthView in a modal. With an active session it shows the UserButton, `Signed in as <email>` (`e2e.auth.signedIn`), the user ID (`e2e.auth.userId`), the session ID (`e2e.auth.sessionId`), and a `Sign out` button (`e2e.auth.signOut`). The home reads each of these from the hook that a customer's app would use. The signed-out text and the buttons come from `useAuth`, the email and the user ID from `useUser`, and the session ID from `useSession`. A hook that keeps a stale value after a sign-out leaves its text on the home, and `host.expectSignedOut` then fails. A pending session counts as signed out on the home.

The test app shows the home again when a full-screen AuthView or a custom form completes its flow, when the close button of the full-screen AuthView calls `onDismiss`, and when the Back button on the root of the embedded profile calls `onHostBack`. The native modules and token cache screens have no way back. It draws nothing on or around a native view. While Clerk loads or a ticket signs in, it shows a spinner. The two full-screen AuthViews also show the spinner until `useAuthViewState().isLoaded` is true, so AuthView on screen after one of those taps proves that flag. When a launch cannot start, the test app shows `Something went wrong` and the reason (`e2e.launch.error`). A launch without verify inputs shows none of this. It shows the home in the test app's `App.tsx`, which `integration/tests/expo-native/` drives.

The test app has a screen or a small flow of its own only where the native views cannot prove a thing. The custom sign-in and sign-up forms drive `useSignIn` and `useSignUp`. The test app reads the `@clerk/expo` token cache once, as the app starts and before Clerk has loaded, and the `Token cache` screen says whether a client token was kept from the last launch. `Sign in with a logo` opens the home's modal AuthView with a React Native view as its `logo`. The `Embedded profile` screen is UserProfileView inline with one custom page, `isDismissible={false}`, and `onHostBack`. The `Native modules` screen has one button for `useSignInWithGoogle` and one for `useBiometricCredentials`, each with its result as text. The test app looks and behaves as an app does for a real user. When a change needs a flow that no native view covers, add a screen that a real app would have, and assert on the outcome as a user sees it.

On iOS, locate nodes of the native views with the SDK's identifiers, such as `screen.getByTestId('clerk.auth.start.identifier')`. The clerk-android release that `@clerk/expo` pins has no test tags, so `specs/native.ts` finds the Android native views by text. The home has `e2e.*` testIDs, which `host.app` holds, and the test app's other screens have `verify.*` testIDs, on both platforms. All of these identifiers are internal test hooks, not public API, and they can change. Every spec keeps at least one exact assertion on an identifier or on visible text.

A spec file that needs other settings than the standard ones has a settings file beside it, with the same name and `.settings.json` in place of `.e2e.ts`. `run` puts the application on those settings before the tests in that spec file start. Any other JSON file under `specs/` stops every run. [Test instances](references/instances.md) has the rules for a declaration.

### Check your work

Golden specs under `specs/golden/<feature>/` are committed and cover the feature map in `features/`, which starts at `features/README.md`. Run the features your change touches, on both platforms when the change is not specific to one. For new work:

1. Write a spec under `specs/explored/`, which is gitignored. It imports the fixture as `'../fixtures.ts'`.
2. Run it by path.
3. Run `screen` after the run, pass or fail. It prints the tree that the app is on now, with each node's role, label, and testID.
4. Fix the locators from that output until the spec passes.
5. When the change adds or changes user-facing behavior, move the spec to `specs/golden/<feature>/`, change its import to `'../../fixtures.ts'`, `git add` it, and update the feature file. Otherwise leave it where it is. The run directory keeps a copy of every spec the run used.

A failing spec prints `FAIL`, the first assertion message, and the path of its failure page, and `run` exits 1. The failure page (`.verify/runs/<run-id>/e2e/failures/*.md`) lists every step, the screen tree at the failure, and a screenshot. A run in which no test executed, such as a `--grep` that matches nothing, fails with `NO_SPECS` and exits 3, because it proved nothing.

With `--retries`, a test that fails and then passes prints `flaky` and the error of its failed attempt, and a `flaky` line under the results counts such tests. `run.json` records the test as `flaky` with its `attempts`, never as passed, and `run` exits 0. The failure page of the failed attempt and the files of every attempt stay in the run directory. A test that fails on every attempt prints `FAIL`, and `run` exits 1.

### Agent steps

e2e has a built-in agent, which a test drives with `agent.act(...)` and `agent.assert(...)`. The CLI configures it only when the machine has a Vercel AI Gateway key. The model is `anthropic/claude-haiku-5.5`, and `openai/gpt-6-luna-fast` is the gateway's backup. Supply the key in `AI_GATEWAY_API_KEY_FILE`, a file that only you can read, or in `AI_GATEWAY_API_KEY`. The `agent` line of `doctor` shows the model and where the key came from. Committed golden specs do not use agent steps.

## Evidence

Every `run` writes `.verify/runs/<run-id>/` and prints its path.

| File                      | What it holds                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run.json`                | The record: `results` per spec, `platform`, `backend`, `gitHead`, `dirty`, `build`, `device`, `identities`, `settings`, and `tainted`                                                                                                                                                                                                                                                                                                                          |
| `video.mp4`               | The whole run, from `simctl io recordVideo` on iOS or `adb shell screenrecord` on Android                                                                                                                                                                                                                                                                                                                                                                      |
| `screenshots/<label>.png` | Every `host.screenshot(label)`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `app.log`                 | Device log lines. On Android they include the app's `[verify]` console lines. On a local iOS device they are native lines only, and the `[verify]` lines are in `.verify/runtime/metro-<port>.log`. The test app writes one `[verify]` line each time its screen, user, session, or launch error changes, with the `launchId` that a failed `host.launch` names. No spec reads these lines. They are for diagnosing a failure that the screen does not explain |
| `e2e/`, `e2e.log`         | e2e's `report.json` and `junit.xml`, its failure pages, and its console output                                                                                                                                                                                                                                                                                                                                                                                 |
| `specs/`                  | A copy of every spec the run used, with its settings file when it has one                                                                                                                                                                                                                                                                                                                                                                                      |

A proof drives the real user path. The video and the screenshots show the action and its result as a user sees them. It checks side effects where the app shows them, such as the user ID and the session ID on the home, not only that the last screen appeared.

After a run, the CLI searches the run directory for every secret the run used: the Platform API key, the instance's secret key, sign-in tickets, and a GitHub token in `GITHUB_TOKEN` or `GH_TOKEN`. A hit marks the file as tainted in `run.json`. The user ID and the session ID on the home are not secrets, because neither can sign anyone in.

```console
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo attach <run-id> --pr <n>                       # the video and every screenshot
$ .claude/skills/verify-clerk-expo/bin/control-clerk-expo attach <run-id> --pr <n> --screenshot profile  # the video and one screenshot
```

`attach` posts one comment per run and PR with `gh pr comment --attach`. It needs a `gh` whose `gh pr comment` has that flag, and it fails with a fix when the flag is missing. It refuses a run that is tainted, that has a failing spec or no passing one, or whose `app.log` names a user that the run did not create.

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
released  verify-ios-1, verify-android-1 (emulator-5560)
deleted   1 application (<application>, with every test user in it)
stopped   watch <pid>, agent-device <pid>, metro <pid>, metro <pid>
kept      80 runs in .verify/runs/
```

That `down` released a lane of each platform.

While the other platform stays leased, `down --platform <p>` releases that platform's lane and stops its Metro. It keeps the application, the watch build, and the agent-device daemon, which the other lane still uses, and it prints `kept    this worktree's throwaway instances, which its <platform> lease still uses`.

`down` never deletes `.verify/runs/`, and it prints how many runs it kept. Evidence lives inside the worktree, so `git worktree remove` deletes it with the rest. Copy the runs you need out first. `down` leaves the test app's generated files in `integration/templates/expo-native`, which are gitignored, so the next `up` reuses them.

If a worktree is removed without `down`, the next `up` or `run` in any worktree on the same Mac finishes for it, and prints a `reap` line for each lane and ledger it cleans up.

## For maintainers of the skill

- `src/core/`, `src/platform/ios/`, `src/platform/android/`, `specs/fixtures.ts`, `testing/`, and every test but `test/host.test.ts` and `test/freshness.test.ts` are shared with the clerk-ios and clerk-android verification skills. Change them there first, then copy them here. `doctor`'s `core-drift` check fails when a file under `src/core/` differs from `src/core/MANIFEST`, and `node src/core/manifest.ts --write` in the skill directory regenerates the manifest.
- `src/host.ts`, `src/fixture.ts`, and `src/freshness.ts` are this repository's own: the build of the test app, the Metro ports, and the check that Metro serves current JS. `specs/native.ts` holds the per-platform locators for the native views and the locators of the home's links.
- `npm test --prefix .claude/skills/verify-clerk-expo` runs the CLI's unit tests, with no network, key, or device. `npm run typecheck --prefix .claude/skills/verify-clerk-expo` runs `tsc`. The `Verify Skill Tests` job in `.github/workflows/ci.yml` runs both on Linux when a pull request changes the skill, the test app, or a package the test app links.
- `run --github-report` hands the results of the run to `@e2e-dev/github` as one report. The reporter writes the report to the job summary. With a `GITHUB_TOKEN` that may write pull request comments, it also posts one comment on the pull request and updates that comment on later runs. The reporter never changes the exit code, and nothing is reported for a run with a tainted file.
- The skill's files are in `.claude/skills/verify-clerk-expo/`. `.cursor/skills/verify-clerk-expo` is a symlink to that directory, so edit only the `.claude` copy.
