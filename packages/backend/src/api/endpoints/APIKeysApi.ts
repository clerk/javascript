import { joinPaths } from '../../util/path';
import type { APIKey } from '../resources/APIKey';
import { AbstractAPI } from './AbstractApi';

const basePath = '/api_keys';

export class APIKeysAPI extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<APIKey>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
