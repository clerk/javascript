---
"@clerk/expo": patch
---

Fix `MissingActivity` error on cold-start Google sign-in / passkey flows. Previously, the first tap on "Sign in with Google" in `<AuthView />` failed with `Clerk error: Google sign-in cannot start: Credential Manager requires an active Activity context.` — the workaround was to background and foreground the app once before signing in.

The Android bridge now calls `Clerk.attachActivity()` (added in clerk-android 1.0.16) at SDK initialization and on AuthView/UserProfile mount, so the current Activity is registered with the underlying SDK before any Credential Manager call. No app-side changes required; the fix is transparent on rebuild.
