import { toSessionTransferError } from './errors';
import { resolveBrowserLauncher } from './launchBrowser';
import { mintSessionTransfer, resolveTransferRequest } from './sessionTransfer';

/**
 * Options for `openInBrowser`.
 */
export type OpenInBrowserParams = {
  /**
   * Absolute URL on one of your instance's domains. It must use HTTPS outside development instances.
   */
  destination: string;
};

const inFlight = new Map<string, Promise<void>>();

/**
 * Opens `destination` in the default browser with the active user signed in.
 *
 * It resolves once the operating system hands the sign-in URL to the browser. That does not mean the
 * web page signed the user in. If signing in fails there, the browser lands on `destination` with
 * `__clerk_status=session_transfer_failed` and an `__clerk_error_code`, and the promise has already
 * resolved. It rejects with a `SessionTransferError` when the URL can't be prepared or no browser
 * opens it. Calls for the same destination that overlap share one URL and open one browser tab.
 *
 * On Android it needs `expo-intent-launcher`, and `expo-application` when the package name is not
 * in your app config. Install them with `npx expo install expo-intent-launcher expo-application`.
 *
 * @param params - The page to open.
 *
 * @example
 * ### Open the web app from a button
 * ```tsx
 * import { isSessionTransferError, openInBrowser } from '@clerk/expo/native-to-web';
 *
 * function OpenOnWebButton() {
 *   const onPress = async () => {
 *     try {
 *       await openInBrowser({ destination: 'https://app.example.com/settings' });
 *     } catch (error) {
 *       if (isSessionTransferError(error) && error.code === 'signed_out') {
 *         router.replace('/sign-in');
 *         return;
 *       }
 *       Alert.alert('Could not open the web app');
 *     }
 *   };
 *
 *   return <Button title='Open on web' onPress={onPress} />;
 * }
 * ```
 */
export function openInBrowser({ destination }: OpenInBrowserParams): Promise<void> {
  try {
    const launch = resolveBrowserLauncher();
    const request = resolveTransferRequest({ destination, presentation: 'browser' });
    const key = `${request.sessionId}\n${destination}`;
    const existing = inFlight.get(key);
    if (existing) {
      return existing;
    }

    const opening = mintSessionTransfer(request)
      .then(transfer => launch(transfer.url))
      .finally(() => {
        if (inFlight.get(key) === opening) {
          inFlight.delete(key);
        }
      });
    inFlight.set(key, opening);
    return opening;
  } catch (error) {
    return Promise.reject(toSessionTransferError(error));
  }
}
