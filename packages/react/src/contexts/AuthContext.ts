import { createContextAndHook } from '@clerk/shared';
import type { ActJWTClaim } from '@clerk/types';

export const [AuthContext, useAuthContext] = createContextAndHook<{
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null | undefined;
}>('AuthContext');
