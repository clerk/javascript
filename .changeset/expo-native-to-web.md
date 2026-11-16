---
'@clerk/expo': minor
---

Add `@clerk/expo/native-to-web` to open your web app with the native app's user already signed in, in a WebView or in the system browser.

- `useAuthenticatedWebView({ destination })` prepares a one-time sign-in link and returns `webViewProps` to spread onto a `react-native-webview` `<WebView>`, plus a `status` of `preparing`, `loading`, `ready`, `signed-out`, or `error`. Render the WebView once `webViewProps` is set and keep your loading overlay over it until `status` is `ready`, so users never see Clerk's sign-in page between your app and the destination. Pass your own WebView callbacks, such as `onShouldStartLoadWithRequest`, to the hook so they run alongside Clerk's. A remount or React Strict Mode reuses a link the WebView has not received yet.
- `openInBrowser({ destination })` opens the destination in the default browser. It resolves once the browser has the link, not once the web page has signed the user in. On Android it needs `expo-intent-launcher`, so install it with `npx expo install expo-intent-launcher expo-application`.
- `prepareSessionTransfer({ destination, presentation })` from `@clerk/expo/native-to-web/advanced` returns the link for apps that present it themselves.

Failures reject or report a `SessionTransferError`, which you can detect with `isSessionTransferError()` and branch on through its `code`, such as `signed_out`, `feature_not_enabled`, or `expired`. Session transfers must be enabled for your instance, and `destination` must be on one of your instance's domains.
