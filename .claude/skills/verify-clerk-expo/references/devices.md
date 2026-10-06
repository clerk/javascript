# Local devices

Read this when a local lane fails to lease or boot, when you need a lane's UDID or serial, or when you call `agent-device` yourself.

## Lanes

- **iOS.** A lane is a clone of `Clerk Verify Template iOS` named `verify-ios-<n>`, with `n` from 1 to 4. The clone is deleted and re-cloned when a lease is lost or released, so a lane name can map to a different UDID from one lease to the next. Read the UDID from the `deviceId` field of `.verify/leases/ios.json`.
- **Android.** A lane boots the `Clerk_Verify_Pixel` AVD with `-read-only -no-window` on port 5558 + 2n, so its serial is `emulator-5560` or `emulator-5562`, and sets the `en-US` locale. `-read-only` lets two lanes share the AVD and throws away their writes. After boot the lane is marked with the system property `debug.verify.lane`, set to the claim's nonce, and `up` and `down` boot, drive, or kill only an emulator that carries its own claim's marker. Any other emulator on a lane port is foreign: `doctor` lists it as `lane-ports` and the CLI never kills it. `up` also runs `adb reverse` for the lane's Metro port and marks the dev menu onboarding finished, which a `-read-only` emulator forgets on every boot.
- The machine holds four iOS and two Android lanes, across all agents. When all are taken, `up` and `run` fail with `POOL_FULL`. While `--wait <seconds>` waits, the CLI prints one `wait` line naming the lanes in use.
- Before leasing, `up` and `run` release lanes whose claiming process is gone and whose worktree no longer exists, and print a `reap` line for each.

## The agent-device daemon

Each worktree runs its own agent-device daemon from `.claude/skills/verify-clerk-expo/node_modules/.bin/agent-device`, with state under `.claude/skills/verify-clerk-expo/.verify/agent-device/`. A daemon shared across worktrees breaks every worktree once the worktree that started it is removed. The CLI sets `AGENT_DEVICE_STATE_DIR` for e2e and for every `agent-device` call, and `down` stops the daemon. If you call `agent-device` yourself, set `AGENT_DEVICE_STATE_DIR` to that directory. `down --dry-run` shows the daemon's pid in its `would stop` line. Never print `daemon.json` in the state directory: it holds the daemon's auth token.
