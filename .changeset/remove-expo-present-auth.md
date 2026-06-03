---
'@clerk/expo': minor
---

Update the beta Expo prebuilt component APIs to align more closely with the native Clerk SDKs.

Remove unused Expo prebuilt-view bridge code: the native `presentAuth`, `presentUserProfile`, and Clerk session `signOut` bridges, Android presentation activities/factory paths, the user-profile modal hook, and stale `Inline*` source files now superseded by app-presented `AuthView` and `UserProfileView`.

Align `AuthView` dismissal with the native SDK lifecycle. App code now owns presentation while the native auth view requests `onDismiss` for user dismissal and successful auth completion after native post-auth routing is complete.

Separate native view events from auth-state sync events. Expo host views now forward only dismissal through the view event channel, while sign-in and sign-out updates use the internal native auth-state sync channel.

When auth state changes on one side of the Expo bridge, the opposite client now refreshes from Clerk instead of issuing a second sign-out.

Align `UserButton` with the native Clerk SDKs by wrapping the platform-native user button, letting it present the user profile from the button itself.

Bump the bundled clerk-android prebuilt UI dependency to `1.0.20` for the native `AuthView` dismissal callbacks used by the Expo wrapper.
