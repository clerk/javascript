---
'@clerk/nextjs': patch
---

Add new telemetry event KEYLESS_ENV_DRIFT_DETECTED to detect drift between publishable and secret keys in keyless apps and values in the .env file.

This event only fires once as controlled with the .clerk/.tmp/telemetry.json file to prevent telemetry event noise