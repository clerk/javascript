import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

interface VerifyTokenResponse {
  id: string;
  type: string;
  subject: string;
  name: string;
  claims: Record<string, string>;
  revoked: boolean;
  expired: boolean;
  expiration: number | null;
  created_by: string | null;
  creation_reason?: string | null;
  created_at: number;
  updated_at: number;
}

const basePath = '/api_keys';

export class APIKeysAPI extends AbstractAPI {
  async verifySecret(secret: string): Promise<VerifyTokenResponse> {
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
