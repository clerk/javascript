# @clerk/expo end-to-end tests

The tests in `specs/` are an ordinary [e2e](https://github.com/tester-army/e2e) project. `e2e.config.ts` and the files under `specs/` run with `npx e2e run` when the environment names three things: a device, a build of the `expo-native` test app, and a Clerk development instance.

The CLI in `bin/` and `src/` sits on top of that project. It makes those three things for a run, and it adds what a pull request needs. The tests never import the CLI. `test/seam.test.ts` fails when a file under `specs/` or `e2e.config.ts` names a path outside `specs/`.

To prove a change, use the CLI. `.claude/skills/verify-clerk-expo/SKILL.md` has the steps. Run a test by hand when you want e2e alone, for example to work on a test with e2e's own flags.

## Run a test by hand

You need Node 24.8 or newer on 24, Xcode and a booted iOS simulator, or the Android SDK and a running emulator, and the publishable key and secret key of a Clerk development instance.

```sh
cd integration/expo-native
npm ci
node src/fixture.ts ios
export CLERK_E2E_PLATFORM=ios
xcrun simctl list devices booted
export CLERK_E2E_DEVICE=<the id of a booted simulator, from the list above>
export CLERK_E2E_APP_PATH=<the path on the last line that the build printed>
export CLERK_PUBLISHABLE_KEY=pk_test_...
export CLERK_SECRET_KEY=sk_test_...
npx e2e run specs/golden/custom-flow-sign-in/complete.e2e.ts
```

`node src/fixture.ts ios` runs `pnpm install`, builds the packages the test app uses, and builds the test app in `integration/templates/expo-native` as a standalone app. A standalone app carries its JavaScript, so the run needs no Metro server. `node src/fixture.ts android` builds the APK for an emulator.

To run against a dev client instead, `integration/expo-native/bin/control-clerk-expo up --platform ios` builds one, leaves it under `.verify/builds/`, and starts the Metro server it loads its bundle from. The `metro` line that `up` prints has the port. Set `CLERK_E2E_APP_PATH` to the `.app` or `.apk` in that directory and `CLERK_E2E_DEV_SERVER` to `http://localhost:<port>`. After `up` ends, no CLI process is running, and Metro stays up until `down`.

`--video on`, `--retries`, `--grep`, and `--output` are e2e's own flags. e2e writes its report and its screenshots to `.e2e/`, which git ignores.

| Setting                 | Needed           | What it is                                                                                                                                                                                                                                                                    |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLERK_E2E_DEVICE`      | yes              | The id of a booted simulator, as `xcrun simctl list devices booted` prints it, or the serial of a running emulator, as `adb devices` prints it, such as `emulator-5554`. A name is not accepted. On Android, a `host:port` address and the serial of a phone are refused too. |
| `CLERK_E2E_APP_PATH`    | no               | A build of the test app for that platform. The first launch of a run installs it. Leave it unset when the app is already on the device.                                                                                                                                       |
| `CLERK_E2E_PLATFORM`    | yes              | `ios` or `android`. This package drives both, and a run drives one.                                                                                                                                                                                                           |
| `CLERK_E2E_DEV_SERVER`  | for a dev client | The address of the Metro server that serves the bundle, such as `http://localhost:8081`. Leave it unset for a standalone build, which carries its bundle.                                                                                                                     |
| `CLERK_PUBLISHABLE_KEY` | yes              | The `pk_test_` key of a development instance.                                                                                                                                                                                                                                 |
| `CLERK_SECRET_KEY`      | yes              | The `sk_test_` key of the same instance. The tests create users and sign-in tickets with it. A `pk_live_` or `sk_live_` key is refused.                                                                                                                                       |

## The instance

The tests expect the settings in `src/core/instances/base.json`, which the CLI puts on the application it creates. On an instance with those settings, every test file that has no settings file beside it passes by hand.

An instance left at Clerk's defaults passes only part of the suite. The tests that sign in with a ticket, or sign up with an email address and a password, pass. The tests that need a phone number, an email code at sign-in, organizations, or a second account on the device fail, because a new instance has none of those turned on.

Every run creates users with addresses like `verify_<run>_<random>+clerk_test@example.com` and never deletes them. A development instance holds 100 users. Use an instance that you can empty.

## Test files that need the CLI

This test file has a `.settings.json` file beside it, and passes only on an instance with those settings:

- `specs/golden/native-modules/biometric-availability.e2e.ts`

The CLI's `run` puts the instance on the declared settings before the file starts, and e2e alone does not. Run them through the CLI, for example `integration/expo-native/bin/control-clerk-expo run native-modules` from the repo root.

## What a run by hand does not do

- It creates no Clerk application, changes no instance settings, and replaces no instance that is filling up.
- It leases and locks no device. Run one test process per device at a time.
- It does not rebuild the app when the sources change.
- It records no video of the whole run. `--video on` records one per attempt.
- It keeps no sealed run directory, scans nothing for secrets, redacts no log, and posts nothing to a pull request.
- It leaves the `agent-device` daemon that e2e started running, and on iOS with it the runner process that the daemon keeps. `npx agent-device daemon stop --clean` stops both. Without `--clean` the iOS runner stays.

## Layout

- `e2e.config.ts` and `specs/` are the e2e project. `specs/golden/` has the tests, `specs/fixtures.ts` has the `host` fixture they use, `specs/app.ts` names the test app, and `specs/support/` is the tests' support code. `specs/support/inputs.ts` is the only file that reads the settings above.
- `bin/` and `src/` are the CLI. Under the CLI the test process gets the same settings, with one difference: in place of the secret key it gets the address and token of a stand-in that the CLI runs on this machine. The stand-in forwards the three Backend API calls the tests make, for this run's test users only, so the test process never holds the key.
- `test/` and `testing/` are the unit tests of both. `npm test` runs them, with no device, key, or network.
- `src/core/`, `specs/support/`, `specs/fixtures.ts`, and `e2e.config.ts` are the same files, byte for byte, in clerk-ios, clerk-android, and clerk/javascript. `src/core/MANIFEST` lists them, and the CLI's `doctor` fails when they differ from it.
