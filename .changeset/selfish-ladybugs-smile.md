---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Deprecate `afterSignOutUrl` and `afterMultiSessionSingleSignOutUrl` from UserButton.

Developers can now configure these directly in `ClerkProvider` and have them work properly without in UserButton, UserProfile and in impersonation mode.
