---
'@clerk/clerk-js': patch
---

Apply the Safari ITP cookie refresh on sign-out.

Signing out re-issues the client cookie from a fetch, which Safari's ITP caps at 7 days. The client outlives sign-out, and it is what Client Trust uses to recognize a known device, so the cap meant a user who signed out and came back more than a week later was treated as being on a new device and challenged for a second factor.

`signOut()` now routes its redirect through `/v1/client/touch` when the client cookie is close to expiring, the same workaround `setActive()` already applies after sign-in. The redirect is left unchanged when no refresh is needed.

This covers `signOut()` calls that navigate to a redirect URL, including `<UserButton />` and `<SignOutButton />`. Passing your own callback to `signOut(callback)` still navigates on your behalf and is not decorated.
