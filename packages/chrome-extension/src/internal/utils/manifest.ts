import type { SetRequired } from 'type-fest';
import type { Manifest } from 'webextension-polyfill';

import type { ClerkClientExtensionFeatures } from '../../types';
import { VALID_HOST_PERMISSION_REGEX } from '../constants';
import { errorThrower, missingManifestKeyError, missingValidManifestHostPermission } from './errors';

export type ValidatedManifest = SetRequired<Manifest.WebExtensionManifest, 'permissions' | 'host_permissions'>;

export function validateManifest(
  manifest: Manifest.WebExtensionManifest,
  features: ClerkClientExtensionFeatures,
): asserts manifest is ValidatedManifest {
  const hasFeatures = Boolean(features) && Object.keys(features).length > 0;

  if (!manifest.permissions) {
    return errorThrower.throw(missingManifestKeyError('permissions'));
  }

  if (!manifest.permissions.includes('storage')) {
    return errorThrower.throw(missingManifestKeyError('permissions.storage'));
  }

  if (!hasFeatures) {
    return;
  }

  if (features.background && !manifest.background) {
    return errorThrower.throw(missingManifestKeyError('background'));
  }

  if (features.sync && !manifest.permissions.includes('cookies')) {
    return errorThrower.throw(missingManifestKeyError('permissions.cookies'));
  }

  if (features.sync && !manifest.host_permissions) {
    return errorThrower.throw(missingManifestKeyError('host_permissions'));
  }
}

export function validateHostPermissionExistence(hostPermissions: string[], hostHint: string): void {
  if (!hostPermissions?.length) {
    errorThrower.throw(missingValidManifestHostPermission(hostHint));
  }
}

export function getValidPossibleManifestHosts(manifest: ValidatedManifest): string[] {
  const uniqueHosts = new Set<string>();

  for (const host of manifest.host_permissions) {
    const res = host.match(VALID_HOST_PERMISSION_REGEX)?.[1];

    if (res) {
      uniqueHosts.add(res);
    }
  }

  return [...uniqueHosts];
}
