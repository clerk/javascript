import { joinPaths } from '../../util/path';
import { Client } from '../resources/Client';
import { AbstractAPI } from './AbstractApi';

const basePath = '/clients';

export class ClientAPI extends AbstractAPI {
  public async getClientList() {
    return this.APIClient.request<Array<Client>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async getClient(clientId: string) {
    this.requireId(clientId);
    return this.APIClient.request<Client>({
      method: 'GET',
      path: joinPaths(basePath, clientId),
    });
  }

  public verifyClient(token: string) {
    return this.APIClient.request<Client>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { token },
    });
  }
}
