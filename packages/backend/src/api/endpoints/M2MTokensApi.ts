import { joinPaths } from '../../util/path';
import type { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

export class M2MTokensApi extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<M2MToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
