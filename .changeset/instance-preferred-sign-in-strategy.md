---
'@clerk/backend': minor
---

Add support for the `preferredSignInStrategyWhenPasswordRequired` parameter to `clerkClient.instance.update()`. Accepts `'password'` or `'otp'` to override the preferred sign-in strategy when a password is required, or an empty string to clear the override.
