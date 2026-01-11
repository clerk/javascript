import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';

// Support both Vite-style and generic env var names for disabling keyless mode
const KEYLESS_DISABLED =
  isTruthy(getEnvVariable('VITE_CLERK_KEYLESS_DISABLED')) ||
  isTruthy(getEnvVariable('CLERK_KEYLESS_DISABLED')) ||
  false;

/**
 * Whether keyless mode can be used in the current environment.
 * Keyless mode is only available in development and when not explicitly disabled.
 *
 * To disable keyless mode, set either:
 * - `VITE_CLERK_KEYLESS_DISABLED=1` (for Vite-based projects)
 * - `CLERK_KEYLESS_DISABLED=1` (generic)
 */
export const canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED;
