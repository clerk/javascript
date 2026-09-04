---
'@clerk/clerk-js': minor
'@clerk/localizations': minor
'@clerk/react': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add self-serve Directory Sync (SCIM) setup. The `Organization` resource gains `getDirectorySync()` and `createDirectorySync()` for the directory bound to an enterprise connection, and the returned `DirectorySync` resource exposes `update()`, `rotateToken()`, `delete()`, and `getUsers()`; the SCIM bearer token is only returned by `createDirectorySync()` and `rotateToken()`. The `OrganizationProfile` Security page gains a Directory Sync section, and the internal `ConfigureDirectorySync` component walks through the setup. Both are only shown when the instance has self-serve Directory Sync enabled.
