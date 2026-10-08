# Local devices

Read this when a local lane fails to lease or boot, or when you need a lane's UDID or serial.

## Lanes

- **iOS.** A lane is a clone of `Clerk Verify Template iOS` named `verify-ios-<n>`, with `n` from 1 to 4. The clone is deleted and re-cloned when a lease is lost or released, so a lane name can map to a different UDID from one lease to the next. Read the UDID from the `deviceId` field of `.verify/leases/ios.json`.
- **Android.** A lane boots the `Clerk_Verify_Pixel` AVD with `-read-only -no-window` on port 5558 + 2n, so its serial is `emulator-5560` or `emulator-5562`. `-read-only` lets two lanes share the AVD and throws away their writes. Any other emulator on a lane port is foreign: `doctor` lists it as `lane-ports` and the CLI never kills it.
- The machine holds four iOS and two Android lanes, across all agents. While `--wait <seconds>` waits, the CLI prints one `wait` line naming the lanes in use.
- Before leasing, `up` and `run` release lanes whose claiming process is gone and whose worktree no longer exists, and print a `reap` line for each.
