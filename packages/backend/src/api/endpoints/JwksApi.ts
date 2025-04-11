import type { JwksJSON } from '../resources/JSON';
import { AbstractAPI } from './AbstractApi';

const basePath = '/jwks';

export class JwksAPI extends AbstractAPI {
  public async getJwks() {
    return this.request<JwksJSON>({
      method: 'GET',
      path: basePath,
    });
  }
}
