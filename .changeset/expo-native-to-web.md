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
      {/* Render the WebView as soon as it has props. It loads the link to sign the user in. */}
      {web.webViewProps && <WebView {...web.webViewProps} style={{ flex: 1 }} />}
      {/* Cover Clerk's sign-in page until the destination has loaded */}
      {web.status !== 'ready' && <ActivityIndicator style={StyleSheet.absoluteFill} />}
    </View>
  );
}
```

Pass your own WebView callbacks, such as `onShouldStartLoadWithRequest`, to the hook. Setting them on `<WebView>` replaces the hook's own handlers.

For more advanced cases, such as opening the link in a WebView or browser you manage yourself, create it with `prepareSessionTransfer()`:

```ts
import { prepareSessionTransfer } from '@clerk/expo/native-to-web';

const { url } = await prepareSessionTransfer({
  destination: 'https://app.example.com/reports',
  // 'webview' for a WebView you render, 'browser' for a browser
  presentation: 'webview',
});

// Open the link once, within 60 seconds, and never log or store it
```

On Android, a browser only accepts the link when the intent that opens it names your app as the referrer.
