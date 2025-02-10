import { buildErrorThrower } from '@clerk/shared/error';

export type HostPermissionHintOpts = {
  hostHint: string;
};

export const errorLogger = (err: Error) => console.error(err, err.stack);
export const errorThrower = buildErrorThrower({ packageName: '@clerk/chrome-extension' });

export const missingManifestKeyError = (key: string) => `Missing \`${key}\` entry in manifest.json`;

export function assertPublishableKey(publishableKey: unknown): asserts publishableKey {
  if (!publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
  }
}
