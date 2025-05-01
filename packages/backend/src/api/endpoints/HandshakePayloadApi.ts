import type { HandshakePayload } from '../resources/HandshakePayload';
import { AbstractAPI } from './AbstractApi';

const BASE_PATH = '/handshake_payload';

type GetHandshakePayloadParams = {
  nonce: string;
};

export class HandshakePayloadAPI extends AbstractAPI {
  public async getHandshakePayload(queryParams: GetHandshakePayloadParams) {
    return this.request<HandshakePayload>({
      method: 'GET',
      path: BASE_PATH,
      queryParams,
    });
  }
}
