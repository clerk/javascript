import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';

const KEYLESS_DISABLED = isTruthy(getEnvVariable('VITE_CLERK_KEYLESS_DISABLED')) || false;

/**
 * Whether keyless mode can be used in the current environment.
 * Keyless mode is only available in development and when not explicitly disabled.
 */
export const canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED;
