import { AllowlistIdentifier } from '../resources/AllowlistIdentifier';
import { AbstractApi } from './AbstractApi';

const basePath = '/allowlist_identifiers';

type AllowlistIdentifierCreateParams = {
  identifier: string;
  notify: boolean;
};

export class AllowlistIdentifierApi extends AbstractApi {
  public async getAllowlistIdentifierList() {
    return this._restClient.makeRequest<Array<AllowlistIdentifier>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async createAllowlistIdentifier(
    params: AllowlistIdentifierCreateParams
  ) {
    return this._restClient.makeRequest<AllowlistIdentifier>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async deleteAllowlistIdentifier(allowlistIdentifierId: string) {
    this.requireId(allowlistIdentifierId);
    return this._restClient.makeRequest<AllowlistIdentifier>({
      method: 'DELETE',
      path: `${basePath}/${allowlistIdentifierId}`,
    });
  }
}
