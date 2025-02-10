import { isTruthy } from '@clerk/shared/underscore';

import { safeAccess } from '~/utils/safe-access';

import { createConsoleInspector } from './console';

export function getInspector() {
  if (
    __DEV__ &&
    process.env.NODE_ENV === 'development' &&
    isTruthy(
      safeAccess(() => process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG_UI ?? process.env.CLERK_ELEMENTS_DEBUG_UI, false),
    )
  ) {
    return createConsoleInspector({
      enabled: true,
      debugServer: isTruthy(safeAccess(() => process.env.CLERK_ELEMENTS_DEBUG_SERVER, false)),
    });
  }
  return undefined;
}
