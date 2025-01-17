import { isDevelopmentEnvironment } from '@clerk/shared/utils';

import { KEYLESS_DISABLED } from '../server/constants';
import { isNextWithUnstableServerActions } from './sdk-versions';

const canUseKeyless__server = !isNextWithUnstableServerActions && isDevelopmentEnvironment() && !KEYLESS_DISABLED;
const canUseKeyless__client = !isNextWithUnstableServerActions && isDevelopmentEnvironment() && !KEYLESS_DISABLED;

export { canUseKeyless__client, canUseKeyless__server };
