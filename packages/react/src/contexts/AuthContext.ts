import { makeContextAndHook } from '../utils/makeContextAndHook';

export const [AuthContext, useAuthContext] = makeContextAndHook<{
  userId: string | null | undefined;
  sessionId: string | null | undefined;
}>('AuthContext');
