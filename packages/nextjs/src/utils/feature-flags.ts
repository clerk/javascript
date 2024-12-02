import { isDevelopmentEnvironment } from '@clerk/shared/utils';

import { ENABLE_KEYLESS } from '../server/constants';
import { isNextWithUnstableServerActions } from './sdk-versions';

const canUseKeyless__server = !isNextWithUnstableServerActions && isDevelopmentEnvironment() && ENABLE_KEYLESS;
const canUseKeyless__client = !isNextWithUnstableServerActions && ENABLE_KEYLESS;

export { canUseKeyless__client, canUseKeyless__server };
