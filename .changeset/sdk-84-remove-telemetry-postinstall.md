---
'@clerk/shared': patch
---

Remove the `postinstall` lifecycle script that displayed the telemetry disclosure notice. The same one-time disclosure is now surfaced at runtime when the telemetry collector activates on a development instance. The browser uses `localStorage` so the notice persists across page loads; Node uses a `globalThis` flag so it shows at most once per process. This removes install-time code from the published package and drops the `std-env` dependency.
