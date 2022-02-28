import { PublicUserData } from '.';

export interface OrganizationMembershipResource {
  id: string;
  publicUserData: PublicUserData;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipRole = 'admin' | 'basic_member';
