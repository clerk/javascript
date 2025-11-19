import type { ClerkPaginationRequest } from '@clerk/shared/types';

import type { PaginatedResourceResponse } from '../../api/resources/Deserializer';
import { joinPaths } from '../../util/path';
import type { APIKey } from '../resources/APIKey';
import { AbstractAPI } from './AbstractApi';

const basePath = '/api_keys';

type GetAPIKeyListParams = ClerkPaginationRequest<{
  /**
   * The user or organization ID to query API keys by
   */
  subject: string;
  /**
   * Whether to include invalid API keys.
   *
   * @default false
   */
  includeInvalid?: boolean;
}>;

type CreateAPIKeyParams = {
  /**
   * API key name
   */
  name: string;
  /**
   * The user or organization ID to associate the API key with
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
  async list(queryParams: GetAPIKeyListParams) {
    return this.request<PaginatedResourceResponse<APIKey[]>>({
      method: 'GET',
      path: basePath,
      queryParams,
    });
  }

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
