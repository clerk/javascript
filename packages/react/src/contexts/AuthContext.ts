import { createContextAndHook } from '@clerk/shared/react';
import type {
  ActClaim,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SessionStatusClaim,
} from '@clerk/shared/types';

export type AuthContextValue = {
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  sessionStatus: SessionStatusClaim | null | undefined;
  sessionClaims: JwtPayload | null | undefined;
  actor: ActClaim | null | undefined;
  orgId: string | null | undefined;
  orgRole: OrganizationCustomRoleKey | null | undefined;
  orgSlug: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
  factorVerificationAge: [number, number] | null;
};

export const [AuthContext, useAuthContext] = createContextAndHook<AuthContextValue>('AuthContext');
