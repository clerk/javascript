import { joinPaths } from '../../util/path';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

export class MachineTokensApi extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<MachineToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
