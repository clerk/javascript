import { OrganizationResource } from './organization';
import { PublicUserData } from './session';

export interface OrganizationMembershipResource {
  id: string;
  organization: OrganizationResource;
  publicUserData: PublicUserData;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
}

export type MembershipRole = 'admin' | 'basic_member';

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
