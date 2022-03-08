import { Organization } from '../resources/Organization';
import { AbstractApi } from './AbstractApi';

const basePath = '/organizations';

type CreateParams = {
  name: string;
  createdBy: string;
};

export class OrganizationApi extends AbstractApi {
  public async createOrganization(params: CreateParams) {
    return this._restClient.makeRequest<Organization>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }
}
