export interface OrganizationMembershipResource {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export type MemberRole = 'admin' | 'basic_member';
