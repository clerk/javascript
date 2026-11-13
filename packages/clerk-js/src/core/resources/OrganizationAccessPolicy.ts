import type {
  ClerkPaginatedResponse,
  CreateOrganizationAccessPolicyParams,
  OrganizationAccessDomainOwnership,
  OrganizationAccessDomainOwnershipJSON,
  OrganizationAccessPolicyJSON,
  OrganizationAccessPolicyResource,
  UpdateOrganizationAccessPolicyParams,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

function accessPoliciesPath(organizationId: string): string {
  return `/organizations/${encodeURIComponent(organizationId)}/access_policies`;
}

function toAccessPolicyBody({ domains, enrollmentMode, status, authentication }: UpdateOrganizationAccessPolicyParams) {
  return {
    domains,
    enrollmentMode,
    status,
    authentication: authentication && {
      connections: authentication.connectionIds,
      directories: authentication.directoryIds,
      provisioning: authentication.provisioning,
      connection_required: authentication.connectionRequired,
    },
  };
}

export class OrganizationAccessPolicy extends BaseResource implements OrganizationAccessPolicyResource {
  id!: string;
  organizationId!: string;
  isDefault!: boolean;
  domains!: OrganizationAccessPolicyResource['domains'];
  enrollmentMode!: OrganizationAccessPolicyResource['enrollmentMode'];
  status!: OrganizationAccessPolicyResource['status'];
  authentication!: OrganizationAccessPolicyResource['authentication'];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationAccessPolicyJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(organizationId: string, params: CreateOrganizationAccessPolicyParams) {
    const json = (
      await BaseResource._fetch<OrganizationAccessPolicyJSON>({
        path: accessPoliciesPath(organizationId),
        method: 'POST',
        body: toAccessPolicyBody(params) as any,
      })
    )?.response as OrganizationAccessPolicyJSON;

    return new OrganizationAccessPolicy(json);
  }

  static async ownershipVerification(
    organizationId: string,
    action: 'prepare_ownership_verification' | 'attempt_ownership_verification',
    domains: string[],
  ): Promise<ClerkPaginatedResponse<OrganizationAccessDomainOwnership>> {
    const { data, total_count } = (
      await BaseResource._fetch({
        path: `${accessPoliciesPath(organizationId)}/${action}`,
        method: 'POST',
        body: { domains } as any,
      })
    )?.response as unknown as ClerkPaginatedResponse<OrganizationAccessDomainOwnershipJSON>;

    return {
      total_count,
      data: data.map(result => ({
        domain: result.domain,
        ownershipVerified: result.ownership_verified,
        txtRecordName: result.txt_record_name,
        txtRecordValue: result.txt_record_value,
      })),
    };
  }

  update = (params: UpdateOrganizationAccessPolicyParams): Promise<this> =>
    this._basePatch<OrganizationAccessPolicyJSON>({ body: toAccessPolicyBody(params) });

  prepareAffiliationVerification = (params: { domain: string; affiliationEmailAddress: string }): Promise<this> =>
    this._basePost<OrganizationAccessPolicyJSON>({ action: 'prepare_affiliation_verification', body: params });

  attemptAffiliationVerification = (params: { domain: string; code: string }): Promise<this> =>
    this._basePost<OrganizationAccessPolicyJSON>({ action: 'attempt_affiliation_verification', body: params });

  protected fromJSON(data: OrganizationAccessPolicyJSON | null): this {
    if (data) {
      const { authentication } = data;
      this.id = data.id;
      this.organizationId = data.organization_id;
      this.pathRoot = accessPoliciesPath(this.organizationId);
      this.isDefault = data.default;
      this.domains = data.domains.map(domain => ({
        name: domain.name,
        affiliationVerified: domain.affiliation_verified,
        ownershipVerified: domain.ownership_verified,
      }));
      this.enrollmentMode = data.enrollment_mode;
      this.status = data.status;
      this.authentication = authentication && {
        connections: authentication.connections,
        directories: authentication.directories,
        provisioning: authentication.provisioning,
        connectionRequired: authentication.connection_required,
      };
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }
    return this;
  }
}
