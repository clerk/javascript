import { joinPaths } from '../../util/path';
import type { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

export class M2MTokensApi extends AbstractAPI {
  async verifySecret(secret: string): Promise<M2MToken> {
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
