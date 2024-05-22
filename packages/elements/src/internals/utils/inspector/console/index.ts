import { isTruthy } from '@clerk/shared/underscore';

import { createConsoleInspector } from './console';

export function getInspector() {
  if (
    process.env.NODE_ENV === 'development' &&
    isTruthy(process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG ?? process.env.CLERK_ELEMENTS_DEBUG)
  ) {
    return createConsoleInspector({
      enabled: true,
      debugServer: isTruthy(process.env.CLERK_ELEMENTS_DEBUG_SERVER),
    });
  }
  return undefined;
}
