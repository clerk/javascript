---
'@clerk/shared': patch
---

Add support for the `CLERK_TELEMETRY_NOTICE_DISABLED` environment variable. Setting it to `1` (or `true`) suppresses the telemetry disclosure notice printed on dev-server startup while keeping telemetry collection enabled, for users who are okay with telemetry and no longer want the reminder. To disable telemetry collection itself (which also suppresses the notice), continue using `CLERK_TELEMETRY_DISABLED`.
