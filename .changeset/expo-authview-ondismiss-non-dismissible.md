---
'@clerk/expo': patch
---

Fix `AuthView`'s `onDismiss` never firing on iOS when `isDismissible` is `false`. The callback now runs once the auth flow completes, matching Android, so an app-owned modal or screen wrapping the view can close after sign-in.
