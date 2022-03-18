import IsomorphicClerk from '../isomorphicClerk';
import { makeContextAndHook } from '../utils/makeContextAndHook';

/**
 * @internal
 */
export const [IsomorphicClerkContext, useIsomorphicClerkContext] =
  makeContextAndHook<IsomorphicClerk>('IsomorphicClerkContext');
