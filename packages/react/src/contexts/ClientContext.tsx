import { createContextAndHook } from '@clerk/shared';
import { ClientResource } from '@clerk/types';

/**
 * @internal
 */
export const [ClientContext, useClientContext] = createContextAndHook<ClientResource | undefined | null>(
  'ClientContext',
);
