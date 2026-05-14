---
'@clerk/shared': patch
---

Remove the `postinstall` lifecycle script that displayed the telemetry disclosure notice. The same one-time disclosure is now surfaced at runtime when the telemetry collector activates on a development instance, persisting the marker to the same location on Node so users who already saw the notice via `postinstall` will not see it again. This removes install-time code from the published package and drops the `std-env` dependency.
