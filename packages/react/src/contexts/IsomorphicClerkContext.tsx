import { createContextAndHook } from '@clerk/shared';

import IsomorphicClerk from '../isomorphicClerk';

/**
 * @internal
 */
export const [IsomorphicClerkContext, useIsomorphicClerkContext] =
  createContextAndHook<IsomorphicClerk>('IsomorphicClerkContext');
