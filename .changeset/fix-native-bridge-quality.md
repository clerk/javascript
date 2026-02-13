---
'@clerk/expo': patch
'@clerk/react': patch
---

Fix code quality issues across native bridge layer

- Fix forEach callback in `isomorphicClerk` to use block statement, avoiding implicit return lint warning
- Emit `'error'` status instead of `'ready'` when `clerk.load()` fails in `isomorphicClerk`
- Add `isMountedRef` guards after every `await` in `syncNativeAuthToJs` to prevent state mutations after unmount
- Only call `onSuccess` after `syncNativeSession` succeeds in `AuthView`; call `onError` on sync failure
- Replace non-null assertion and `as any` cast with null-check and type guard in `syncNativeSession`
- Cancel Recomposer and CoroutineScope in `onDetachedFromWindow` to prevent coroutine leaks (Android)
- Replace direct SharedPreferences access with `Clerk.session?.fetchToken()` public API (Android)
- Return `UIViewController` from inline view factories to preserve SwiftUI lifecycle (iOS)
- Retain `UIHostingController` as child view controller in `ExpoView` subclasses (iOS)
- Handle auth event stream termination and nil `createdSessionId` by invoking completion with failure (iOS)
