import { isDevelopmentEnvironment } from '@clerk/shared/utils';

import { ALLOW_ACCOUNTLESS } from '../server/constants';
import { isNextWithUnstableServerActions } from './sdk-versions';

const canUseAccountless__server = !isNextWithUnstableServerActions && isDevelopmentEnvironment() && ALLOW_ACCOUNTLESS;
const canUseAccountless__client = !isNextWithUnstableServerActions && ALLOW_ACCOUNTLESS;

export { canUseAccountless__client, canUseAccountless__server };
