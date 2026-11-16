---
'@clerk/expo': minor
---

Introduce `openInBrowser()` for opening a page of your web app in the default browser with the native app's user already signed in.

```tsx
import { isSessionTransferError, openInBrowser } from '@clerk/expo/native-to-web';

try {
  // Opens Safari on iOS or the default browser on Android, signed in as the current user
  await openInBrowser({ destination: 'https://app.example.com/settings' });
} catch (error) {
  // For example, the user signed out of the app
  if (isSessionTransferError(error) && error.code === 'signed_out') router.replace('/sign-in');
}
```

It resolves once the browser has the link, not once the web page has signed the user in. Calls for the same destination that overlap open one browser tab.

On Android it needs two more packages:

```sh
npx expo install expo-intent-launcher expo-application
```
