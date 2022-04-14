import { UserResource } from '@clerk/types';

import { makeContextAndHook } from '../utils/makeContextAndHook';

/**
 * @internal
 */
export const [UserContext, useUserContext] = makeContextAndHook<UserResource | null | undefined>('UserContext');
