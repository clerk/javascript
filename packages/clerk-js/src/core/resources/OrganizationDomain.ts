import type {
  AttemptAffiliationVerificationParams,
  CreateOrganizationDomainParams,
  OrganizationDomainJSON,
  OrganizationDomainOwnershipVerification,
  OrganizationDomainResource,
  OrganizationDomainVerification,
  OrganizationEnrollmentMode,
  PrepareAffiliationVerificationParams,
  UpdateEnrollmentModeParams,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class OrganizationDomain extends BaseResource implements OrganizationDomainResource {
  id!: string;
  name!: string;
  organizationId!: string;
  enrollmentMode!: OrganizationEnrollmentMode;
  verification!: OrganizationDomainVerification | null;
  affiliationVerification!: OrganizationDomainVerification | null;
  ownershipVerification!: OrganizationDomainOwnershipVerification | null;
  affiliationEmailAddress!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  totalPendingInvitations!: number;
  totalPendingSuggestions!: number;

  constructor(data: OrganizationDomainJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(
    organizationId: string,
    { name, enrollmentMode }: CreateOrganizationDomainParams,
  ): Promise<OrganizationDomainResource> {
    const json = (
      await BaseResource._fetch<OrganizationDomainJSON>({
        path: `/organizations/${organizationId}/domains`,
        method: 'POST',
        body: { name, enrollment_mode: enrollmentMode } as any,
      })
    )?.response as unknown as OrganizationDomainJSON;
    return new OrganizationDomain(json);
  }

  prepareAffiliationVerification = async (
    params: PrepareAffiliationVerificationParams,
  ): Promise<OrganizationDomainResource> => {
    return this._basePost({
      path: `/organizations/${this.organizationId}/domains/${this.id}/prepare_affiliation_verification`,
      method: 'POST',
      body: params as any,
    });
  };

  attemptAffiliationVerification = async (
    params: AttemptAffiliationVerificationParams,
  ): Promise<OrganizationDomainResource> => {
    return this._basePost({
      path: `/organizations/${this.organizationId}/domains/${this.id}/attempt_affiliation_verification`,
      method: 'POST',
      body: params as any,
    });
  };

  updateEnrollmentMode = (params: UpdateEnrollmentModeParams): Promise<OrganizationDomainResource> => {
    return this._basePost({
      path: `/organizations/${this.organizationId}/domains/${this.id}/update_enrollment_mode`,
      body: params,
    });
  };

  delete = (): Promise<void> => {
    return this._baseDelete({
      path: `/organizations/${this.organizationId}/domains/${this.id}`,
    });
  };

  protected fromJSON(data: OrganizationDomainJSON | null): this {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.organizationId = data.organization_id;
      this.enrollmentMode = data.enrollment_mode;
      this.affiliationEmailAddress = data.affiliation_email_address;
      this.totalPendingSuggestions = data.total_pending_suggestions;
      this.totalPendingInvitations = data.total_pending_invitations;

      const affiliationVerificationJSON = data.affiliation_verification ?? data.verification;
      if (affiliationVerificationJSON) {
        const affiliationVerification: OrganizationDomainVerification = {
          status: affiliationVerificationJSON.status,
          strategy: affiliationVerificationJSON.strategy,
          attempts: affiliationVerificationJSON.attempts,
          expiresAt: unixEpochToDate(affiliationVerificationJSON.expires_at),
        };
        this.affiliationVerification = affiliationVerification;
        // Deprecated alias, kept in sync for backwards compatibility.
        this.verification = affiliationVerification;
      } else {
        this.affiliationVerification = null;
        this.verification = null;
      }

      if (data.ownership_verification) {
        this.ownershipVerification = {
          status: data.ownership_verification.status,
          strategy: data.ownership_verification.strategy,
          attempts: data.ownership_verification.attempts,
          expiresAt: data.ownership_verification.expire_at
            ? unixEpochToDate(data.ownership_verification.expire_at)
            : null,
          verifiedAt: data.ownership_verification.verified_at
            ? unixEpochToDate(data.ownership_verification.verified_at)
            : null,
          txtRecordName: data.ownership_verification.txt_record_name ?? null,
          txtRecordValue: data.ownership_verification.txt_record_value ?? null,
        };
      } else {
        this.ownershipVerification = null;
      }
    }
    return this;
  }
}
