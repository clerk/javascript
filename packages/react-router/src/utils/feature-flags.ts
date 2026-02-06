import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';

const KEYLESS_DISABLED =
  isTruthy(getEnvVariable('VITE_CLERK_KEYLESS_DISABLED')) ||
  isTruthy(getEnvVariable('CLERK_KEYLESS_DISABLED')) ||
  false;

export const canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED;
