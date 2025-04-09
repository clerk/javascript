import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

// TODO: Temporary response
interface VerifyMachineTokenResponse {
  id: string;
  subject: string;
  [key: string]: unknown;
}

const basePath = '/m2m_tokens';

export class M2MTokensApi extends AbstractAPI {
  async verifyToken(secret: string): Promise<VerifyMachineTokenResponse> {
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
