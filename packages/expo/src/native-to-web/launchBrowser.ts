import { Linking, Platform } from 'react-native';

import { sessionTransferError } from './errors';

export function resolveBrowserLauncher(): (url: string) => Promise<void> {
  if (Platform.OS === 'web') {
    throw sessionTransferError('unsupported_platform', 'Session transfer is only available in native apps.');
  }

  return url =>
    Linking.openURL(url).then(
      () => undefined,
      () => {
        throw sessionTransferError('browser_unavailable', 'No browser could open the sign-in link.');
      },
    );
}
