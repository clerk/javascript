import { isTruthy } from '@clerk/shared/underscore';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';

function hasFileSystemSupport(): boolean {
  if (typeof process === 'undefined' || !process?.versions?.node) {
    return false;
  }
  if (typeof window !== 'undefined') {
    return false;
  }
  return true;
}

const KEYLESS_DISABLED =
  isTruthy(process.env.PUBLIC_CLERK_KEYLESS_DISABLED) || isTruthy(process.env.CLERK_KEYLESS_DISABLED) || false;

export const canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED && hasFileSystemSupport();
