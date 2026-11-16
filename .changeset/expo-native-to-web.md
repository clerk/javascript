---
'@clerk/expo': minor
---

Introduce the `useAuthenticatedWebView()` hook for showing a page of your web app in a WebView with the native app's user already signed in.

```tsx
import { useAuthenticatedWebView } from '@clerk/expo/native-to-web';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Button, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AccountScreen() {
  // Prepares a one-time sign-in link for this page
  const web = useAuthenticatedWebView({ destination: 'https://app.example.com/account' });

  if (web.status === 'signed-out') return <Redirect href='/sign-in' />;
  if (web.status === 'error') return <Button title='Try again' onPress={web.retry} />;

  return (
    <View style={{ flex: 1 }}>
      {/* Render the WebView as soon as it has props, because it has to load the link to sign in */}
      {web.webViewProps && <WebView {...web.webViewProps} style={{ flex: 1 }} />}
      {/* Cover Clerk's sign-in page until the destination has loaded */}
      {web.status !== 'ready' && <ActivityIndicator style={StyleSheet.absoluteFill} />}
    </View>
  );
}
```

Pass your own WebView callbacks, such as `onShouldStartLoadWithRequest`, to the hook instead of to `<WebView>`. Set on `<WebView>`, they would replace the hook's handlers.

For more advanced cases, such as opening the link in a browser or WebView you manage yourself, create it with `prepareSessionTransfer()`:

```ts
import { prepareSessionTransfer } from '@clerk/expo/native-to-web';
import * as WebBrowser from 'expo-web-browser';

// The link works once, within 60 seconds, so create it right before opening it
const transfer = await prepareSessionTransfer({
  destination: 'https://app.example.com/reports',
  presentation: 'browser',
});

// iOS only. Android Custom Tabs can't send the referrer Clerk needs to sign the user in.
await WebBrowser.openBrowserAsync(transfer.url);
```
