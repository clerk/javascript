import type * as IntentLauncher from 'expo-intent-launcher';
import { AppState } from 'react-native';

import { loadExpoApplication } from '../app-version/nativeAppIdentity';
import { getExpoAppIdentifier } from '../utils/appIdentifier';
import { sessionTransferError } from './errors';

export function resolveBrowserLauncher(): (url: string) => Promise<void> {
  const { startActivityAsync } = loadIntentLauncher();
  const packageName = loadExpoApplication()?.applicationId ?? getExpoAppIdentifier();
  if (!packageName) {
    throw sessionTransferError(
      'missing_dependency',
      'Opening a signed-in browser on Android needs the app package name. Install expo-application by running: npx expo install expo-application',
    );
  }

  return url =>
    new Promise<void>((resolve, reject) => {
      const subscription = AppState.addEventListener('change', state => {
        if (state !== 'active') {
          subscription.remove();
          resolve();
        }
      });

      startActivityAsync('android.intent.action.VIEW', {
        data: url,
        extra: { 'android.intent.extra.REFERRER_NAME': `android-app://${packageName}` },
      }).then(
        () => {
          subscription.remove();
          resolve();
        },
        () => {
          subscription.remove();
          reject(sessionTransferError('browser_unavailable', 'No browser could open the sign-in link.'));
        },
      );
    });
}

function loadIntentLauncher(): typeof IntentLauncher {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-intent-launcher') as typeof IntentLauncher;
  } catch {
    throw sessionTransferError(
      'missing_dependency',
      'Opening a signed-in browser on Android needs expo-intent-launcher. Install it by running: npx expo install expo-intent-launcher',
    );
  }
}
