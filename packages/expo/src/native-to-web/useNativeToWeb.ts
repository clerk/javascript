import { toSessionTransferError } from './errors';
import { resolveBrowserLauncher } from './launchBrowser';
import { mintSessionTransfer, resolveTransferRequest } from './sessionTransfer';

/**
 * Options for `openExternalBrowser`.
 */
export type OpenExternalBrowserParams = {
  /**
   * Absolute URL on one of your instance's domains. It must use HTTPS outside development instances.
   */
  destination: string;
};

/**
 * The value `useNativeToWeb` returns.
 */
export type UseNativeToWebReturn = {
  /**
   * Opens `destination` in the system browser with the active user signed in. Resolves once the
   * operating system hands the URL to the browser, and rejects with a `SessionTransferError`.
   * Calls for the same destination that overlap share one URL and open one browser tab.
   *
   * On Android it needs `expo-intent-launcher`, and `expo-application` when the package name is not
   * in your app config. Install them with `npx expo install expo-intent-launcher expo-application`.
   */
  openExternalBrowser: (params: OpenExternalBrowserParams) => Promise<void>;
};

const inFlight = new Map<string, Promise<void>>();

function openExternalBrowser({ destination }: OpenExternalBrowserParams): Promise<void> {
  try {
    const launch = resolveBrowserLauncher();
    const request = resolveTransferRequest({ destination, presentation: 'browser' });
    const existing = inFlight.get(request.key);
    if (existing) {
      return existing;
    }

    const opening = mintSessionTransfer(request)
      .then(transfer => launch(transfer.url))
      .finally(() => {
        if (inFlight.get(request.key) === opening) {
          inFlight.delete(request.key);
        }
      });
    inFlight.set(request.key, opening);
    return opening;
  } catch (error) {
    return Promise.reject(toSessionTransferError(error));
  }
}

const nativeToWeb: UseNativeToWebReturn = { openExternalBrowser };

/**
 * Returns `openExternalBrowser`, which opens a web page in the user's default browser with the
 * active user signed in.
 *
 * @returns An object holding `openExternalBrowser`. The object and the function never change identity.
 *
 * @example
 * ### Open the web app from a button
 * ```tsx
 * import { isSessionTransferError, useNativeToWeb } from '@clerk/expo/native-to-web';
 *
 * function OpenOnWebButton() {
 *   const { openExternalBrowser } = useNativeToWeb();
 *
 *   const onPress = async () => {
 *     try {
 *       await openExternalBrowser({ destination: 'https://app.example.com/settings' });
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
export function useNativeToWeb(): UseNativeToWebReturn {
  return nativeToWeb;
}
