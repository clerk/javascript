---
'@clerk/nextjs': patch
---

Updated implementation of detectKeylessEnvDrift to function when <ClerkProvider /> is implemented in client components. Added canUseKeyless check to detectKeylessEnvDrift to prevent telemetry event from running for production applications.
