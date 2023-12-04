import { parsePublishableKey } from '@clerk/shared';
import { createExtensionSyncManager, events } from '@clerk/shared/extensionSyncManager';

import { STORAGE_KEY_CLIENT_JWT } from './constants';
import { ClerkChromeExtensionError, logErrorHandler } from './errors';
import { ChromeStorageCache } from './utils/storage';

export const ContentScript = {
  init(publishableKey: string) {
    try {
      // Ensure we have a publishable key
      if (!publishableKey) {
        throw new ClerkChromeExtensionError('Missing publishable key.');
      }

      // Parse the publishable key
      const { frontendApi, instanceType } = parsePublishableKey(publishableKey) || {};

      // Ensure we have a valid publishable key
      if (!frontendApi || !instanceType) {
        throw new ClerkChromeExtensionError('Invalid publishable key.');
      }

      // Ensure we're in a development environment
      if (instanceType !== 'development') {
        throw new ClerkChromeExtensionError(`
          You're attempting to load the Clerk Chrome Extension content script in an unsupported environment.
          Please update your manifest.json to exclude production URLs in content_scripts.
        `);
      }

      // Create an extension sync manager
      const extensionSyncManager = createExtensionSyncManager();

      // Listen for token update events from other Clerk hosts
      extensionSyncManager.on(events.DevJWTUpdate, ({ data }) => {
        // Ignore events from other Clerk hosts
        if (data.frontendApi !== frontendApi) {
          console.log('Received a token update event for a different Clerk host. Ignoring.');
          return;
        }

        const KEY = ChromeStorageCache.createKey(data.frontendApi, STORAGE_KEY_CLIENT_JWT);

        if (data.action === 'set') {
          void ChromeStorageCache.set(KEY, data.token);
        } else if (data.action === 'remove') {
          void ChromeStorageCache.remove(KEY);
        }
      });
    } catch (e) {
      logErrorHandler(e as Error);
    }
  },
};
