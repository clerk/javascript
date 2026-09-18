---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
'@clerk/localizations': minor
---

Support Google Workspace directories in Directory Sync. Organization admins can upload a service account key and delegated admin email from the setup flow, start a sync on demand, and see the result of the last one. `DirectorySync` gains `setCredentials()`, `sync()`, `getSyncStatus()`, and `credentialsConfigured`.
