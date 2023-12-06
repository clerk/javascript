import { isPublishableKey, parsePublishableKey } from '@clerk/shared';
import type { PublishableKey } from '@clerk/types';
import type { Manifest } from 'webextension-polyfill';

import { ClerkChromeExtensionError } from '../errors';

export function parseAndValidatePublishableKey(publishableKey: string): PublishableKey {
  if (!isPublishableKey(publishableKey)) {
    throw new ClerkChromeExtensionError('Invalid publishable key');
  }

  const key = parsePublishableKey(publishableKey);

  if (!key?.frontendApi) {
    throw new ClerkChromeExtensionError('Missing Frontend API from publishableKey');
  }

  if (!key?.instanceType) {
    throw new ClerkChromeExtensionError('Missing Instance Type from publishableKey');
  }

  return key;
}

export function validateManifest(manifest: Manifest.WebExtensionManifest): void {
  if (!manifest.permissions) {
    throw new Error('Missing `permissions` key in manifest.json');
  }

  if (!manifest.host_permissions) {
    throw new Error('Missing `host_permissions` key in manifest.json');
  }

  if (!manifest.permissions.includes('cookies')) {
    throw new Error('Missing `cookies` in the `permissions` key in manifest.json');
  }

  if (!manifest.permissions.includes('storage')) {
    throw new Error('Missing `storage` in the `permissions` key in manifest.json');
  }

  // TODO: Validate hosts
}
