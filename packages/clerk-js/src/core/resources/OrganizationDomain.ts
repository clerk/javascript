import type {
  AttemptAffiliationVerificationParams,
  OrganizationDomainJSON,
  OrganizationDomainResource,
  OrganizationDomainVerification,
  OrganizationEnrollmentMode,
  PrepareAffiliationVerificationParams,
  UpdateOrganizationDomainParams,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class OrganizationDomain extends BaseResource implements OrganizationDomainResource {
  id!: string;
  name!: string;
  organizationId!: string;
  enrollmentMode!: OrganizationEnrollmentMode;
  verification!: OrganizationDomainVerification | null;
  affiliationEmailAddress!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationDomainJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(organizationId: string, { name }: { name: string }): Promise<OrganizationDomainResource> {
    const json = (
      await BaseResource._fetch<OrganizationDomainJSON>({
        path: `/organizations/${organizationId}/domains`,
        method: 'POST',
        body: { name } as any,
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

  update = (params: UpdateOrganizationDomainParams): Promise<OrganizationDomainResource> => {
    return this._basePatch({
      method: 'PATCH',
      path: `/organizations/${this.organizationId}/domains/${this.id}`,
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
      if (data.verification) {
        this.verification = {
          status: data.verification.status,
          strategy: data.verification.strategy,
          attempts: data.verification.attempts,
          expiresAt: unixEpochToDate(data.verification.expires_at),
        };
      } else {
        this.verification = null;
      }
    }
    return this;
  }
}
