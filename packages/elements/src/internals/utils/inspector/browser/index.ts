import { isTruthy } from '@clerk/shared/underscore';
import { createBrowserInspector } from '@statelyai/inspect';

import { safeAccess } from '~/utils/safe-access';

export const getInspector = () => {
  if (
    __DEV__ &&
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    isTruthy(
      safeAccess(() => process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG_UI ?? process.env.CLERK_ELEMENTS_DEBUG_UI, false),
    )
  ) {
    const { inspect } = createBrowserInspector({
      autoStart: true,
    });

    return inspect;
  }

  return undefined;
};
