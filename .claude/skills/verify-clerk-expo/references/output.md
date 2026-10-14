# CLI output

## Text output

A verb prints progress lines to stderr while it works and its result to stdout when it ends. An error goes to stderr as two lines: `error`, the error code, and the message, then `fix:` and what to do.

## JSON output

Every verb takes `--json`. The verb then prints no progress lines, and prints one JSON object to stdout.

On success the object is `{ "ok": true, "verb": "<verb>", ... }`. The remaining keys depend on the verb. `src/core/types.ts` defines them as `DoctorReport`, `UpResult`, `RunResult`, `ScreenResult`, `AttachResult`, and `DownResult`.

On an error the object is `{ "ok": false, "error": { "code", "message", "fix", "retryable" } }`.

`doctor --json` prints its report even when a check fails, with `ok: false` and no `error`. Each check has `id`, `ok`, `detail`, and a `fix` when there is one. A warning has `ok: true` and `state: "warning"`. A check that did not run has `ok: true` and `state: "not-run"`.

`attach --json` prints one of two shapes. With `via: "gh"`, this machine edited the description, and the keys are `prUrl`, `posted`, and `alreadyPosted`. With `via: "runner"`, the evidence was handed to the session's runner, and the keys are `pr`, `handedOff`, `because`, `sessionRun`, and `sessionRunUrl`.

`down --json` and `down --dry-run --json` print different keys. A dry run prints `dryRun: true`, `wouldRelease`, `wouldDelete`, `wouldStop`, and `keptRuns`. A real `down` prints `dryRun: false`, `released`, `deletedApplications`, `stoppedProcesses`, and `keptRuns`. Each entry of `wouldDelete` is `{ "kind": "application", "name" }`, and each entry of `deletedApplications` is `{ "name" }`. Neither lists users or organizations. A `down --platform <p>` that keeps the application for the other lane lists no application.

## Exit codes

| Code | Meaning                                                                                                                                                                                                                      |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | The verb succeeded. For `run`, no spec failed. A spec that passed on a retry is `flaky` and does not fail the run. A run in which every selected spec is limited to the other platform also exits 0, so read its `next` line |
| 1    | `run` finished and at least one spec failed or was interrupted                                                                                                                                                               |
| 2    | The error code is `USAGE`                                                                                                                                                                                                    |
| 3    | Any other error, or `doctor` has a failing check                                                                                                                                                                             |

## Error codes

`retryable` is true for `POOL_FULL`, `DEVICE_BUSY`, `LEASE_LOST`, and `RATE_LIMITED`. For those, the same command can succeed later with no other change.

| Code                     | Meaning                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `USAGE`                  | The command line, a spec's declaration, or an environment variable is malformed                                                                                                                                                                                                                                                            |
| `NOT_READY`              | A precondition is missing, such as Metro that does not serve the current code. The fix names it                                                                                                                                                                                                                                            |
| `POOL_FULL`              | All four iOS lanes, or both Android lanes, on this machine are in use                                                                                                                                                                                                                                                                      |
| `DEVICE_BUSY`            | Another command in this worktree is driving the device, or a run on the other platform is using this worktree's application                                                                                                                                                                                                                |
| `LEASE_LOST`             | The leased device or the remote session is gone                                                                                                                                                                                                                                                                                            |
| `BUILD_FAILED`           | A step of the test app's build failed, such as `turbo build`, `expo prebuild`, `xcodebuild`, or `gradlew`. The message names the step and has the last 15 lines of its output. With the remote backend, also that the app sources have uncommitted changes, that GitHub does not have HEAD, or that the session could not build the commit |
| `KEYS_MISSING`           | No Platform API credential works on this machine, or `AI_GATEWAY_API_KEY_FILE` names a file that is missing, empty, or readable by other users                                                                                                                                                                                             |
| `INSTANCE_MISCONFIGURED` | The Clerk instance does not show the settings a spec needs                                                                                                                                                                                                                                                                                 |
| `NOT_TEST_IDENTITY`      | Reserved. No command raises it. A run whose `app.log` names a user that the run did not create fails `attach` with `EVIDENCE_UNSAFE`                                                                                                                                                                                                       |
| `NO_SPECS`               | The selection matched no spec, or no selected spec ran                                                                                                                                                                                                                                                                                     |
| `E2E_CRASHED`            | e2e exited without a readable report. Read `e2e.log` in the run directory                                                                                                                                                                                                                                                                  |
| `EVIDENCE_UNSAFE`        | The run cannot be attached, or a path is not safe to delete                                                                                                                                                                                                                                                                                |
| `UNSUPPORTED`            | This machine cannot do what the command asked, such as `--backend local` for a device it cannot run                                                                                                                                                                                                                                        |
| `RATE_LIMITED`           | Clerk's Platform API kept answering 429                                                                                                                                                                                                                                                                                                    |
