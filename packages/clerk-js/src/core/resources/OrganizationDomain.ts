import type {
  OrganizationDomainJSON,
  OrganizationDomainResource,
  OrganizationDomainVerification,
  OrganizationEnrollmentMode,
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

  // static async get({
  //   organizationId,
  //   domainId,
  // }: {
  //   organizationId: string;
  //   domainId: string;
  // }): Promise<OrganizationDomainResource> {
  //   const json = (
  //     await BaseResource._fetch<OrganizationDomainJSON>({
  //       path: `/organizations/${organizationId}/domains/${domainId}`,
  //       method: 'GET',
  //     })
  //   )?.response as unknown as OrganizationDomainJSON;
  //   return new OrganizationDomain(json);
  // }

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
