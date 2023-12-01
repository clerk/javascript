import type { Manifest } from 'webextension-polyfill';

import { errorThrower, missingManifestKeyError } from '../utils/errors';

export function validateManifest(manifest: Manifest.WebExtensionManifest): void {
  if (!manifest.permissions) {
    return errorThrower.throw(missingManifestKeyError('permissions'));
  }

  if (!manifest.host_permissions) {
    return errorThrower.throw(missingManifestKeyError('host_permissions'));
  }

  if (!manifest.permissions.includes('cookies')) {
    return errorThrower.throw(missingManifestKeyError('permissions.cookies'));
  }

  if (!manifest.permissions.includes('storage')) {
    return errorThrower.throw(missingManifestKeyError('permissions.storage'));
  }

  // TODO: Validate hosts
}
