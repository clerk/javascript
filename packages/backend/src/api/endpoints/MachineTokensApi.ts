import type { JwtPayload } from '@clerk/types';

import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

// TODO: Temporary response
interface VerifyMachineTokenResponse {
  id: string;
  subject: string;
  claims: JwtPayload;
}

const basePath = '/m2m_tokens';

export class MachineTokensAPI extends AbstractAPI {
  async verifyMachineToken(secret: string): Promise<VerifyMachineTokenResponse> {
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
