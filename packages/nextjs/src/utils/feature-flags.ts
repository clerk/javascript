import { isAutomatedEnvironment, isDevelopmentEnvironment } from '@clerk/shared/utils';

import { KEYLESS_DISABLED } from '../server/constants';
// Next.js inlines NODE_ENV on the client bundle. CI detection is reliable server-side,
// while client bundles only see automation signals that are explicitly exposed.
const canUseKeyless = isDevelopmentEnvironment() && !isAutomatedEnvironment() && !KEYLESS_DISABLED;

export { canUseKeyless };
