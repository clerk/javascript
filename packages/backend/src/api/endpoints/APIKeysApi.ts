import { joinPaths } from '../../util/path';
import type { APIKey } from '../resources/APIKey';
import { AbstractAPI } from './AbstractApi';

const basePath = '/api_keys';

type ListAPIKeysParams = {
  /**
   * API key type. Currently, only 'api_key' is supported.
   */
  type?: 'api_key';
  /**
   * user or organization ID the API key is associated with
   */
  subject: string;
  includeInvalid?: boolean;
};

type CreateAPIKeyParams = {
  type?: 'api_key';
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

type UpdateAPIKeyParams = {
  /**
   * API key ID
   */
  apiKeyId: string;
  /**
   * API key description
   */
  description?: string | null;
  claims?: Record<string, any> | null;
  scopes?: string[];
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
  async list(params: ListAPIKeysParams) {
    return this.request<APIKey[]>({
      method: 'GET',
      path: basePath,
      queryParams: {
        type: params.type,
        subject: params.subject,
        include_invalid: params.includeInvalid,
      },
    });
  }

  async create(params: CreateAPIKeyParams) {
    return this.request<APIKey>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  async update(params: UpdateAPIKeyParams) {
    const { apiKeyId, ...bodyParams } = params;

    this.requireId(apiKeyId);

    return this.request<APIKey>({
      method: 'POST',
      path: basePath,
      bodyParams,
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

  async getSecret(apiKeyId: string) {
    this.requireId(apiKeyId);

    return this.request<{ secret: string }>({
      method: 'GET',
      path: joinPaths(basePath, apiKeyId, 'secret'),
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
