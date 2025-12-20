import { isDevelopmentEnvironment } from '@clerk/shared/utils';

import { KEYLESS_DISABLED } from '../server/constants';
// Next.js will inline the value of 'development' or 'production' on the client bundle, so this is client-safe.
const canUseKeyless = isDevelopmentEnvironment() && !KEYLESS_DISABLED;

export { canUseKeyless };
