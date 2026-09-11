---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Support Google Workspace directories in Directory Sync. `DirectorySync` gains `setCredentials()` for the service account key and delegated admin the directory reads Google with, `sync()` to start a sync on demand, `getSyncStatus()` for the last sync result, and `credentialsConfigured` to tell whether a credential is stored.
