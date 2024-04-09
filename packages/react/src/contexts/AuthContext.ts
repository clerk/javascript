import { createContextAndHook } from '@clerk/shared/react';
import type {
  ActJWTClaim,
  CustomPlanKey,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

export const [AuthContext, useAuthContext] = createContextAndHook<{
  userId: string | null | undefined;
  plan: CustomPlanKey | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: OrganizationCustomRoleKey | null | undefined;
  orgSlug: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
  orgPlan: CustomPlanKey | null | undefined;
}>('AuthContext');
