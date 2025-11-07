import { createContextAndHook } from '@clerk/shared/react';
import type {
  ActClaim,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  SessionStatusClaim,
} from '@clerk/shared/types';

export type AuthContextValue = {
  actor: ActClaim | null | undefined;
  factorVerificationAge: [number, number] | null;
  orgId: string | null | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
  orgRole: OrganizationCustomRoleKey | null | undefined;
  orgSlug: string | null | undefined;
  sessionClaims: JwtPayload | null | undefined;
  sessionId: string | null | undefined;
  sessionStatus: SessionStatusClaim | null | undefined;
  userId: string | null | undefined;
};

export const [AuthContext, useAuthContext] = createContextAndHook<AuthContextValue>('AuthContext');
