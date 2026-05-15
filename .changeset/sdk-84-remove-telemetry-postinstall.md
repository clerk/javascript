---
'@clerk/shared': patch
---

Remove the `postinstall` lifecycle script that displayed the telemetry disclosure notice. The same one-time disclosure is now surfaced server-side at runtime when the telemetry collector activates on a development instance, deduped per process via a `globalThis` flag. The notice is intentionally not emitted in browser consoles to keep the noise profile in line with the original postinstall (terminal-only). This removes install-time code from the published package and drops the `std-env` dependency.
