---
"@clerk/clerk-js": patch
---

- Fixes an issue in Connected Accounts menu that was related to Custom OAuth Providers:
- Resolves undefined properties error that occurred when a Custom OAuth Provider was `enabled` but `authenticatable` was set to `false`.
