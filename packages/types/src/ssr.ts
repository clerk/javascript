import type { CustomPlanKey } from './authorization';
import type { ActClaim, JwtPayload } from './jwtv2';
import type { OrganizationResource } from './organization';
import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { Serializable } from './utils';

export type ServerGetTokenOptions = { template?: string };
export type ServerGetToken = (options?: ServerGetTokenOptions) => Promise<string | null>;

export type InitialState = Serializable<{
  sessionClaims: JwtPayload;
  sessionId: string | undefined;
  session: SessionResource | undefined;
  actor: ActClaim | undefined;
  userId: string | undefined;
  user: UserResource | undefined;
  plan: CustomPlanKey | undefined;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPlan: CustomPlanKey | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  organization: OrganizationResource | undefined;
}>;
