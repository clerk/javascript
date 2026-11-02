export interface CreateOrganizationValues {
  name: string;
  slug: string;
  logo: File | null;
}

export interface CreatedOrganization {
  organizationId: string;
  skipInvitations: boolean;
}

export interface CreateOrganizationInviteInput {
  emailAddresses: string[];
  role: string;
  onRejected: (emailAddresses: string[]) => void;
}

export type CreateOrganizationStep =
  | { step: 'create' }
  | { step: 'invite'; organizationId: string }
  | { step: 'sent'; organizationId: string };
