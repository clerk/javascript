import { createContextAndHook } from '@clerk/shared';
import type { ActJWTClaim, MembershipRole } from '@clerk/types';

export const [AuthContext, useAuthContext] = createContextAndHook<{
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: MembershipRole | null | undefined;
  orgSlug: string | null | undefined;
}>('AuthContext');
