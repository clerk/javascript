---
'@clerk/electron': patch
---

Forward OAuth deep-link callbacks to the primary Electron process on Windows and Linux, and bring the
signing-in window to the front when the callback arrives.

Delivering those callbacks requires Electron's single-instance lock, so `createClerkBridge` now
acquires it on Windows and Linux whenever `renderer` is configured, and quits secondary processes
after forwarding their arguments. Applications that previously ran side-by-side instances on those
platforms will become single-instance. macOS is unaffected. Two new escape hatches: the returned
bridge exposes `isPrimaryInstance` so the application can stop its own bootstrap in a secondary
process, and `manageSingleInstanceLock: false` leaves the lock to applications that manage it
themselves.
