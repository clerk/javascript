export interface OrganizationInvitationResource {
  id: string;
  emailAddress: string;
  organizationId: string;
  status: OrganizationInvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';
