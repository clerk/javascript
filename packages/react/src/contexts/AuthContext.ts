import { createContextAndHook } from '@clerk/shared/react';
import type { ActJWTClaim, MembershipRole, OrganizationCustomPermissionKey } from '@clerk/types';

export const [AuthContext, useAuthContext] = createContextAndHook<{
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: MembershipRole | null | undefined;
  orgSlug: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
}>('AuthContext');
