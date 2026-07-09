---
'@clerk/expo': minor
---

Add an embedded navigation mode to the native `UserProfileView` and `AuthView` components so they can be pushed onto your app's own navigation stack without a double header.

- New optional `hideHeader` prop hides Clerk's built-in navigation header while keeping its internal navigation working.
- New optional `onNavigationChange` prop reports the component's internal navigation state (`{ depth, canGoBack }`) so your header can show the right back affordance.
- The components now expose a ref with `goBack()` and `popToRoot()` to drive Clerk's internal stack from your own back buttons and gestures.
- New `@clerk/expo/native/router` entry point ships prewired expo-router screens (`UserProfileScreen`, `AuthScreen`) that handle header back buttons, iOS gestures, Android hardware back, and automatic route dismissal for you. Requires `expo-router` (new optional peer dependency).

Existing usage is unaffected: all new props are optional, and the components render exactly as before unless `hideHeader` is set. Requires the corresponding clerk-ios and clerk-android SDK releases with hosted-navigation support.
