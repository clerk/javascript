---
'@clerk/nextjs': patch
---

Fix keyless drift logic to support client components and ensure only apps on development are included. Change createClerkClient to accept an argument for samplingRate in telemetry options and update the ClerkOptions type.
