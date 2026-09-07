---
"@clerk/clerk-js": patch
"@clerk/expo": major
---

Run native iOS authentication and profile operations through Expo's existing Clerk.js client. Native components require a rebuilt application containing the matching Clerk iOS runtime adapter. The previous two-way client synchronization is removed; Android native components will require their own adapter, while Android JS authentication remains available.
