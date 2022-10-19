import { createContextAndHook } from '@clerk/shared';
import { UserResource } from '@clerk/types';

/**
 * @internal
 */
export const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
