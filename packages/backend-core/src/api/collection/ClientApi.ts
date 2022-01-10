import { Client } from '../resources/Client';
import { AbstractApi } from './AbstractApi';

export class ClientApi extends AbstractApi {
  public async getClientList() {
    return this._restClient.makeRequest<Array<Client>>({
      method: 'GET',
      path: '/clients',
    });
  }

  public async getClient(clientId: string) {
    this.requireId(clientId);
    return this._restClient.makeRequest<Client>({
      method: 'GET',
      path: `/clients/${clientId}`,
    });
  }

  public verifyClient(token: string) {
    return this._restClient.makeRequest<Client>({
      method: 'POST',
      path: '/clients/verify',
      bodyParams: { token },
    });
  }
}
