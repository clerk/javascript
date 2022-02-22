export interface OrganizationMembershipResource {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipRole = 'admin' | 'basic_member';
