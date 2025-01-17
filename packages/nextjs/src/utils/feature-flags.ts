import { isDevelopmentEnvironment } from '@clerk/shared/utils';

import { ENABLE_KEYLESS } from '../server/constants';
import { isNextWithUnstableServerActions } from './sdk-versions';

const canUseKeyless =
  !isNextWithUnstableServerActions &&
  // Next.js will inline the value of 'development' or 'production' on the client bundle, so this is client-safe.
  isDevelopmentEnvironment() &&
  ENABLE_KEYLESS;

export { canUseKeyless };
