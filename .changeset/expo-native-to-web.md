---
'@clerk/expo': minor
---

Add `@clerk/expo/native-to-web` to open your web app with the native app's user already signed in, in a WebView.

- `useAuthenticatedWebView({ destination })` prepares a one-time sign-in link and returns `webViewProps` to spread onto a `react-native-webview` `<WebView>`, plus a `status` of `preparing`, `ready`, `signed-out`, or `error`. Keep your loading overlay up while `status` is `preparing`, so users never see Clerk's sign-in page between your app and the destination. A remount or React Strict Mode reuses a link the WebView has not received yet.
- `prepareSessionTransfer({ destination, presentation })` from `@clerk/expo/native-to-web/advanced` returns the link for apps that present it themselves.

Failures reject or report a `SessionTransferError`, which you can detect with `isSessionTransferError()` and branch on through its `code`, such as `signed_out`, `feature_not_enabled`, or `expired`. Session transfers must be enabled for your instance, and `destination` must be on one of your instance's domains.
