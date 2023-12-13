import type { SetRequired } from 'type-fest';
import type { Manifest } from 'webextension-polyfill';

import { VALID_HOST_PERMISSION_REGEX } from '../constants';
import { errorThrower, missingManifestKeyError, missingValidManifestHostPermission } from '../utils/errors';

export type ValidatedManifest = SetRequired<Manifest.WebExtensionManifest, 'permissions' | 'host_permissions'>;

export function validateManifest(manifest: Manifest.WebExtensionManifest): asserts manifest is ValidatedManifest {
  if (!manifest.permissions) {
    return errorThrower.throw(missingManifestKeyError('permissions'));
  }

  if (!manifest.permissions.includes('cookies')) {
    return errorThrower.throw(missingManifestKeyError('permissions.cookies'));
  }

  if (!manifest.permissions.includes('storage')) {
    return errorThrower.throw(missingManifestKeyError('permissions.storage'));
  }

  if (!manifest.host_permissions) {
    return errorThrower.throw(missingManifestKeyError('host_permissions'));
  }
}

export function validateHostPermissionExistence(hostPermissions: string[], hostHint: string): void {
  if (!hostPermissions?.length) {
    return errorThrower.throw(missingValidManifestHostPermission(hostHint));
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
