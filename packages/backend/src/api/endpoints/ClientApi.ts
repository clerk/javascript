import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { Client } from '../resources/Client';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { HandshakePayload } from '../resources/HandshakePayload';
import { AbstractAPI } from './AbstractApi';

const basePath = '/clients';

type GetHandshakePayloadParams = {
  nonce: string;
};

/** @generateWithEmptyComment */
export class ClientAPI extends AbstractAPI {
  /**
   * @deprecated This method is deprecated and will be removed in a future version.
   */
  public async getClientList(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<Client[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  /**
   * Gets the given [`Client`](https://clerk.com/docs/reference/backend/types/backend-client). The clients are returned sorted by creation date, with the newest clients appearing first.
   * @param clientId - The ID of the client to get.
   */
  public async getClient(clientId: string) {
    this.requireId(clientId);
    return this.request<Client>({
      method: 'GET',
      path: joinPaths(basePath, clientId),
    });
  }

  /**
   * Verifies the client in the given token.
   * @param token - The token to verify.
   * @returns The verified [`Client`](https://clerk.com/docs/reference/backend/types/backend-client).
   */
  public verifyClient(token: string) {
    return this.request<Client>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { token },
    });
  }

  public async getHandshakePayload(queryParams: GetHandshakePayloadParams) {
    return this.request<HandshakePayload>({
      method: 'GET',
      path: joinPaths(basePath, 'handshake_payload'),
      queryParams,
    });
  }
}
