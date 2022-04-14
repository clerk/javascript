import { ActiveSessionResource } from '@clerk/types';

import { makeContextAndHook } from '../utils/makeContextAndHook';

/**
 * @internal
 */
export const [SessionContext, useSessionContext] = makeContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);
