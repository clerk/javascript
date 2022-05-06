import { Organization } from '../resources/Organization';
import { AbstractApi } from './AbstractApi';

const basePath = '/organizations';

type OrganizationMetadataParams = {
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
};

type CreateParams = {
  name: string;
  slug?: string;
  createdBy: string;
} & OrganizationMetadataParams;

type OrganizationMetadataRequestBody = {
  publicMetadata?: string;
  privateMetadata?: string;
};

type UpdateMetadataParams = OrganizationMetadataParams;

export class OrganizationApi extends AbstractApi {
  public async createOrganization(params: CreateParams) {
    const { publicMetadata, privateMetadata } = params;
    return this._restClient.makeRequest<Organization>({
      method: 'POST',
      path: basePath,
      bodyParams: {
        ...params,
        ...stringifyMetadataParams({
          publicMetadata,
          privateMetadata,
        }),
      },
    });
  }

  public async updateOrganizationMetadata(organizationId: string, params: UpdateMetadataParams) {
    this.requireId(organizationId);

    return this._restClient.makeRequest<Organization>({
      method: 'PATCH',
      path: `${basePath}/${organizationId}/metadata`,
      bodyParams: stringifyMetadataParams(params),
    });
  }
}

function stringifyMetadataParams(
  params: OrganizationMetadataParams & {
    [key: string]: Record<string, unknown> | undefined;
  },
): OrganizationMetadataRequestBody {
  return ['publicMetadata', 'privateMetadata'].reduce(
    (res: Record<string, string>, key: string): Record<string, string> => {
      if (params[key]) {
        res[key] = JSON.stringify(params[key]);
      }
      return res;
    },
    {},
  );
}
