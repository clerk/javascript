import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';
import { isAutomatedEnvironment, isDevelopmentEnvironment } from '@clerk/shared/utils';

// Support both Vite-style and generic env var names
const KEYLESS_DISABLED =
  isTruthy(getEnvVariable('VITE_CLERK_KEYLESS_DISABLED')) ||
  isTruthy(getEnvVariable('CLERK_KEYLESS_DISABLED')) ||
  false;

/**
 * Whether a missing key pair defers to `authenticateRequest`, so its CLI-pointing
 * missing-publishable-key error surfaces. The SDK no longer activates keyless mode.
 *
 * True only in development, outside automated/CI environments, and unless either is set:
 * - `VITE_CLERK_KEYLESS_DISABLED=1` (for Vite-based projects)
 * - `CLERK_KEYLESS_DISABLED=1` (generic)
 */
export const canUseKeyless = isDevelopmentEnvironment() && !isAutomatedEnvironment() && !KEYLESS_DISABLED;
