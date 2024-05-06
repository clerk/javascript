---
'@clerk/shared': patch
'@clerk/types': patch
---

The following are all internal changes and not relevant to any end-user:

Create type interface for `TelemetryCollector` on `@clerk/types`. This allows to assign `telemetry` on the main Clerk SDK object, while inhering from the actual `TelemetryCollector` implementation.
