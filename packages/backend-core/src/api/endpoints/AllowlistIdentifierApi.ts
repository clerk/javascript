import { joinPaths } from '../../util/path';
import { AllowlistIdentifier } from '../resources/AllowlistIdentifier';
import { AbstractAPI } from './AbstractApi';

const basePath = '/allowlist_identifiers';

type AllowlistIdentifierCreateParams = {
  identifier: string;
  notify: boolean;
};

export class AllowlistIdentifierAPI extends AbstractAPI {
  public async getAllowlistIdentifierList() {
    return this.APIClient.request<Array<AllowlistIdentifier>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async createAllowlistIdentifier(params: AllowlistIdentifierCreateParams) {
    return this.APIClient.request<AllowlistIdentifier>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async deleteAllowlistIdentifier(allowlistIdentifierId: string) {
    this.requireId(allowlistIdentifierId);
    return this.APIClient.request<AllowlistIdentifier>({
      method: 'DELETE',
      path: joinPaths(basePath, allowlistIdentifierId),
    });
  }
}
