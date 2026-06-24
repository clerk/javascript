import type { ClerkPaginationRequest } from '@clerk/shared/types';

import type { PaginatedResourceResponse } from '../../api/resources/Deserializer';
import { joinPaths } from '../../util/path';
import type { APIKey } from '../resources/APIKey';
import type { DeletedObject } from '../resources/DeletedObject';
import { AbstractAPI } from './AbstractApi';

const basePath = '/api_keys';

/** @generateWithEmptyComment */
export type GetAPIKeyListParams = ClerkPaginationRequest<{
  /** The user or Organization ID to query API keys by. */
  subject: string;
  /** Whether to include invalid API keys (revoked or expired). Defaults to `false`. */
  includeInvalid?: boolean;
}>;

/** @generateWithEmptyComment */
export type CreateAPIKeyParams = {
  /** A descriptive name for the API key (e.g., "Production API Key", "Development Key"). */
  name: string;
  /** The user or Organization ID to associate the API key with. */
  subject: string;
  /** The description of the API key. */
  description?: string | null;
  /** Custom claims to store additional information about the API key. */
  claims?: Record<string, any> | null;
  /** Scopes to limit the API key's access to specific resources. */
  scopes?: string[];
  /** The user ID of the user who created the API key. */
  createdBy?: string | null;
  /** The number of seconds until the API key expires. Defaults to `null` (never expires). */
  secondsUntilExpiration?: number | null;
};

/** @generateWithEmptyComment */
export type RevokeAPIKeyParams = {
  /** The ID of the API key to revoke. */
  apiKeyId: string;
  /** The reason for revoking the API key. Useful for your records. */
  revocationReason?: string | null;
};

/** @generateWithEmptyComment */
export type UpdateAPIKeyParams = {
  /** The ID of the API key to update. */
  apiKeyId: string;
  /** The user or Organization ID to associate the API key with. */
  subject: string;
  /** The description of the API key. */
  description?: string | null;
  /** Custom claims to store additional information about the API key. */
  claims?: Record<string, any> | null;
  /** Scopes to limit the API key's access to specific resources. */
  scopes?: string[];
  /** The number of seconds until the API key expires. Defaults to `null` (never expires). */
  secondsUntilExpiration?: number | null;
};

/** @generateWithEmptyComment */
export class APIKeysAPI extends AbstractAPI {
  /**
   * Gets a list of API keys for the given user or Organization.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) objects and a `totalCount` property containing the total number of API keys for the user or Organization.
   */
  async list(queryParams: GetAPIKeyListParams) {
    return this.request<PaginatedResourceResponse<APIKey[]>>({
      method: 'GET',
      path: basePath,
      queryParams,
    });
  }

  /**
   * Creates a new API key for the given user or Organization.
   * @returns The created [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async create(params: CreateAPIKeyParams) {
    return this.request<APIKey>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Gets the given [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   * @param apiKeyId - The ID of the API key to get.
   */
  async get(apiKeyId: string) {
    this.requireId(apiKeyId);

    return this.request<APIKey>({
      method: 'GET',
      path: joinPaths(basePath, apiKeyId),
    });
  }

  /**
   * Updates the given API key.
   * @returns The updated [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async update(params: UpdateAPIKeyParams) {
    const { apiKeyId, ...bodyParams } = params;

    this.requireId(apiKeyId);

    return this.request<APIKey>({
      method: 'PATCH',
      path: joinPaths(basePath, apiKeyId),
      bodyParams,
    });
  }

  /**
   * Deletes the given API key.
   * @param apiKeyId - The ID of the API key to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async delete(apiKeyId: string) {
    this.requireId(apiKeyId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, apiKeyId),
    });
  }

  /**
   * Revokes the given API key. This will immediately invalidate the API key and prevent it from being used to authenticate any future requests.
   * @returns The revoked [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async revoke(params: RevokeAPIKeyParams) {
    const { apiKeyId, revocationReason = null } = params;

    this.requireId(apiKeyId);

    return this.request<APIKey>({
      method: 'POST',
      path: joinPaths(basePath, apiKeyId, 'revoke'),
      bodyParams: { revocationReason },
    });
  }

  /**
   * Gets the secret of the given API key.
   * @param apiKeyId - The ID of the API key to get the secret of.
   */
  async getSecret(apiKeyId: string) {
    this.requireId(apiKeyId);

    return this.request<{ secret: string }>({
      method: 'GET',
      path: joinPaths(basePath, apiKeyId, 'secret'),
    });
  }

  /**
   * Verifies the given API key.
   * - If the API key is valid, the method returns the API key object with its properties.
   * - If the API key is invalid, revoked, or expired, the method will throw an error.
   * @param secret - The secret of the API key to verify.
   * @returns The verified [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async verify(secret: string) {
    return this.request<APIKey>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
