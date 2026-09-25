---
"@clerk/clerk-js": patch
"@clerk/shared": patch
---

Preserve indefinite native session deadlines when loading and restoring sessions. Sessions expose `hasMaximumLifetime` to distinguish a configured expiration from an indefinite lifetime.
