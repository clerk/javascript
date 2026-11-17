import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export type WritableAccessPolicyEnrollmentMode = 'invitation_only' | 'invite_automatically' | 'request_access' | 'sso';

export type AccessPolicyEnrollmentMode = WritableAccessPolicyEnrollmentMode | 'join_automatically' | 'blocked';
export type AccessPolicyStatus = 'draft' | 'active';
export type AccessPolicyProvisioning = 'jit' | 'directory';

export interface OrganizationAccessPolicyDomain {
  name: string;
  affiliationVerified: boolean;
  ownershipVerified: boolean;
}

export interface OrganizationAccessPolicyAuthentication {
  connections: Array<{ id: string; name: string; active: boolean }>;
  directories: Array<{ id: string; name: string }>;
  provisioning: AccessPolicyProvisioning;
  connectionRequired: boolean;
}

export interface OrganizationAccessPolicyJSON extends ClerkResourceJSON {
  object: 'organization_access_policy';
  organization_id: string;
  default: boolean;
  domains: Array<{ name: string; affiliation_verified: boolean; ownership_verified: boolean }>;
  enrollment_mode: AccessPolicyEnrollmentMode;
  status: AccessPolicyStatus | null;
  authentication: {
    connections: OrganizationAccessPolicyAuthentication['connections'];
    directories: OrganizationAccessPolicyAuthentication['directories'];
    provisioning: AccessPolicyProvisioning;
    connection_required: boolean;
  } | null;
  created_at: number;
  updated_at: number;
}

export interface OrganizationAccessDomainOwnershipJSON {
  object: 'organization_access_domain_ownership';
  domain: string;
  ownership_verified: boolean;
  txt_record_name: string | null;
  txt_record_value: string | null;
}

export interface OrganizationAccessDomainOwnership {
  domain: string;
  ownershipVerified: boolean;
  txtRecordName: string | null;
  txtRecordValue: string | null;
}

export interface OrganizationAccessPolicyAuthenticationParams {
  connectionIds?: string[];
  directoryIds?: string[];
  provisioning?: AccessPolicyProvisioning;
  connectionRequired?: boolean;
}

export type CreateOrganizationAccessPolicyParams = { domains: string[] } & (
  | {
      enrollmentMode: Exclude<WritableAccessPolicyEnrollmentMode, 'sso'>;
      authentication?: never;
      status?: never;
    }
  | {
      enrollmentMode: 'sso';
      authentication: OrganizationAccessPolicyAuthenticationParams;
      status?: AccessPolicyStatus;
    }
);

export interface UpdateOrganizationAccessPolicyParams {
  domains?: string[];
  enrollmentMode?: WritableAccessPolicyEnrollmentMode;
  authentication?: OrganizationAccessPolicyAuthenticationParams;
  status?: AccessPolicyStatus;
}

export interface OrganizationAccessPolicyResource extends ClerkResource {
  id: string;
  organizationId: string;
  isDefault: boolean;
  domains: OrganizationAccessPolicyDomain[];
  enrollmentMode: AccessPolicyEnrollmentMode;
  status: AccessPolicyStatus | null;
  authentication: OrganizationAccessPolicyAuthentication | null;
  createdAt: Date;
  updatedAt: Date;
  update(params: UpdateOrganizationAccessPolicyParams): Promise<this>;
  prepareAffiliationVerification(params: { domain: string; affiliationEmailAddress: string }): Promise<this>;
  attemptAffiliationVerification(params: { domain: string; code: string }): Promise<this>;
}
