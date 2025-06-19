import { joinPaths } from '../../util/path';
import type { APIKey } from '../resources/APIKey';
import { AbstractAPI } from './AbstractApi';

const basePath = '/api_keys';

type CreateAPIKeyParams = {
  type: 'api_key';
  /**
   * API key name
   */
  name: string;
  /**
   * user or organization ID the API key is associated with
   */
  subject: string;
  /**
   * API key description
   */
  description?: string | null;
  claims?: Record<string, any> | null;
  scopes?: string[];
  createdBy?: string | null;
  secondsUntilExpiration?: number | null;
};

type RevokeAPIKeyParams = {
  /**
   * API key ID
   */
  apiKeyId: string;
  /**
   * Reason for revocation
   */
  revocationReason?: string | null;
};

export class APIKeysAPI extends AbstractAPI {
  async create(params: CreateAPIKeyParams) {
    return this.request<APIKey>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  async revoke(params: RevokeAPIKeyParams) {
    const { apiKeyId, ...bodyParams } = params;

    this.requireId(apiKeyId);

    return this.request<APIKey>({
      method: 'POST',
      path: joinPaths(basePath, apiKeyId, 'revoke'),
      bodyParams,
    });
  }

  async verifySecret(secret: string) {
    return this.request<APIKey>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
