---
'@clerk/backend': minor
---

Add `deprovisioned` to the Backend `User` object and `UserJSON`, so you can tell when Directory Sync has deactivated a user, including in `user.updated` webhook payloads, without casting. It's separate from `banned`: Directory Sync sets and clears `deprovisioned`, while you set `banned` through the Dashboard or Backend API.
