import { createContextAndHook } from '@clerk/shared';
import { ActiveSessionResource } from '@clerk/types';

/**
 * @internal
 */
export const [SessionContext, useSessionContext] = createContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);
