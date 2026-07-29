---
'@clerk/backend': minor
---

Add a `machineId` option to M2M token verification (`clerkClient.m2m.verify()`, `verifyMachineAuthToken()`, and `authenticateRequest()`). When provided, verification additionally requires the M2M token to be scoped for that machine, matching the check the Backend API performs when verifying opaque tokens with a machine secret key. Previously, JWT-format M2M tokens verified locally were only checked for a valid signature and token class, so a token minted for a different machine would still verify successfully.
