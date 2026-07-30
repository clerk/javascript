---
'@clerk/expo': minor
---

Support pushing the native `UserProfileView` and `AuthView` onto your app's own navigation stack.

- New optional `hostBackButton` prop shows a back button on the component's root screen. The component keeps its own navigation chrome, so screen titles, back buttons, swipe-back, and transitions inside the component stay native.
- New optional `onHostBack` prop fires when that root back button is tapped, so you can pop your own route.
- New `@clerk/expo/native/router` entry point ships prewired expo-router screens (`UserProfileScreen`, `AuthScreen`) that hide the route header, wire up the back button, and pop the route when the flow ends (sign-out, account deletion, auth completion). Requires `expo-router` (new optional peer dependency).

Existing usage is unaffected: both new props are optional, and the components render exactly as before unless `hostBackButton` is set. Requires the corresponding clerk-ios and clerk-android SDK releases.
