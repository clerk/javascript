import { createContextAndHook } from '@clerk/shared/react';
import type { ActJWTClaim, OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from '@clerk/types';

export const [AuthContext, useAuthContext] = createContextAndHook<{
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: OrganizationCustomRoleKey | null | undefined;
  orgSlug: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
  __experimental_factorVerificationAge: [number, number] | null;
}>('AuthContext');
