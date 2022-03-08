import { OrganizationInvitationResource } from './organizationInvitation';
import { OrganizationMembershipResource } from './organizationMembership';
import { MembershipRole } from './organizationMembership';

export interface OrganizationResource {
  id: string;
  name: string;
  role: MembershipRole;
  instanceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  getMemberships: (
    params?: GetMembershipsParams,
  ) => Promise<OrganizationMembershipResource[]>;
  getPendingInvitations: () => Promise<OrganizationInvitationResource[]>;
  inviteMember: (
    params: InviteMemberParams,
  ) => Promise<OrganizationInvitationResource>;
  updateMember: (
    params: UpdateMembershipParams,
  ) => Promise<OrganizationMembershipResource>;
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
}

export interface GetMembershipsParams {
  limit?: number;
  offset?: number;
}

export interface InviteMemberParams {
  emailAddress: string;
  role: MembershipRole;
  redirectUrl?: string;
}

export interface UpdateMembershipParams {
  userId: string;
  role: MembershipRole;
}
