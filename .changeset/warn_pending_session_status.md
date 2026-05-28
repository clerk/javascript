---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Add a console warning when a session is in the `pending` state. The SDK treats pending sessions as signed out (`isSignedIn` returns `false`, `useAuth` reports signed out) while remaining session tasks are completed, which previously gave no feedback to developers. This brings the JS SDK in line with the equivalent logger on iOS and Android.
