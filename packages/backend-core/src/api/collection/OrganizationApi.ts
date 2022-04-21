import FormData from 'form-data';
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

type UpdateLogoParams = {
  file: File | Blob;
  uploaderUserId: string;
};

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

  public async updateOrganizationLogo(organizationId: string, { file, uploaderUserId }: UpdateLogoParams) {
    this.requireId(organizationId);

    const body = new FormData();
    body.append('file', file);
    body.append('uploader_user_id', uploaderUserId);

    return this._restClient.makeRequest<Organization>({
      method: 'PUT',
      path: `${basePath}/${organizationId}/logo`,
      contentType: 'multipart/form-data',
      bodyParams: body,
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
