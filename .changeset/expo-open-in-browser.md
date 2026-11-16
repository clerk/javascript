---
'@clerk/expo': minor
---

Introduce `openInBrowser()` for opening a page of your web app in the default browser with the native app's user already signed in.

```tsx
import { isSessionTransferError, openInBrowser } from '@clerk/expo/native-to-web';
import { router } from 'expo-router';

try {
  // Opens Safari on iOS or the default browser on Android, signed in as the current user
  await openInBrowser({ destination: 'https://app.example.com/settings' });
} catch (error) {
  // The app has no signed-in user
  if (isSessionTransferError(error) && error.code === 'signed_out') router.replace('/sign-in');
}
```

It resolves once the browser has the link, not once the web page has signed the user in. A double tap opens one tab, because a second call for the same destination joins the one in progress.

On Android it needs two more packages:

```sh
npx expo install expo-intent-launcher expo-application
```
