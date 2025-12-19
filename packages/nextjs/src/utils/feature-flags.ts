import { canUseKeyless as sharedCanUseKeyless } from '@clerk/shared/keyless';

import { KEYLESS_DISABLED } from '../server/constants';

// Next.js will inline the value of 'development' or 'production' on the client bundle, so this is client-safe.
const canUseKeyless = sharedCanUseKeyless({ disabled: KEYLESS_DISABLED });

export { canUseKeyless };
