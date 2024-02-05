import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { Client } from '../resources/Client';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/clients';

export class ClientAPI extends AbstractAPI {
  public async getClientList(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<Client[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getClient(clientId: string) {
    this.requireId(clientId);
    return this.request<Client>({
      method: 'GET',
      path: joinPaths(basePath, clientId),
    });
  }

  public verifyClient(token: string) {
    return this.request<Client>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { token },
    });
  }
}
