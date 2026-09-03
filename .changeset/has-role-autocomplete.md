---
'@clerk/shared': patch
'@clerk/nextjs': patch
---

Fix IDE autocomplete for custom Organization Roles in server-side `has({ role })` and `auth.protect({ role })`.

Previously, defining roles via `ClerkAuthorization` typed the values correctly but editors often failed to suggest Role literals inside `has({ role: "…" })`, while Permission suggestions already worked. Role checks now use the same generic typing path as Permissions so Role completions appear as expected.
