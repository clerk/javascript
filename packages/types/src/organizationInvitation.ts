export interface OrganizationInvitationResource {
  id: string;
  emailAddress: string;
  status: OrganizationInvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';
