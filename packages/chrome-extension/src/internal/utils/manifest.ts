import type { SetRequired } from 'type-fest';
import type { Manifest } from 'webextension-polyfill';

import type { ClerkClientExtensionFeatures } from '../../types';
import { errorThrower, missingManifestKeyError } from './errors';

export type ValidatedManifest = SetRequired<Manifest.WebExtensionManifest, 'permissions' | 'host_permissions'>;
export type ManifestKeys = keyof Manifest.WebExtensionManifest;

function validateRootManifestKey(manifest: Manifest.WebExtensionManifest, key: ManifestKeys): void {
  if (!manifest[key]) {
    errorThrower.throw(missingManifestKeyError(key));
  }
}

function validateManifestPermission(manifest: Manifest.WebExtensionManifest, key: Manifest.Permission): void {
  if (!manifest.permissions?.includes(key)) {
    errorThrower.throw(missingManifestKeyError(`permissions.${key}`));
  }
}

function hasAdditionalFeatures(features: ClerkClientExtensionFeatures): boolean {
  return Boolean(features) && Object.keys(features).length > 0;
}

export function validateManifest(
  manifest: Manifest.WebExtensionManifest,
  features: ClerkClientExtensionFeatures,
): asserts manifest is ValidatedManifest {
  validateRootManifestKey(manifest, 'permissions');
  validateManifestPermission(manifest, 'storage');

  // If no additional features are provided, we can return success early
  if (!hasAdditionalFeatures(features)) {
    return;
  }

  if (features.background) {
    validateRootManifestKey(manifest, 'background');
  }

  if (features.sync) {
    validateManifestPermission(manifest, 'cookies');
    validateRootManifestKey(manifest, 'host_permissions');
  }
}
