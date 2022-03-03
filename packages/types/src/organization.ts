import { MembershipRole, OrganizationMembershipResource } from '.';

export interface OrganizationResource {
  id: string;
  name: string;
  role: MembershipRole;
  instanceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  getMembers: (
    params?: GetMembersParams,
  ) => Promise<OrganizationMembershipResource[]>;
}

export interface GetMembersParams {
  limit?: number;
  offset?: number;
}
