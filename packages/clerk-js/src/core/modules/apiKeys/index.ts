import { ClerkRuntimeError } from '@clerk/shared/error';
import type {
  ApiKeyJSON,
  APIKeyResource,
  APIKeysNamespace,
  ClerkPaginatedResponse,
  CreateAPIKeyParams,
  GetAPIKeysParams,
  RevokeAPIKeyParams,
} from '@clerk/shared/types';

import type { FapiRequestInit } from '@/core/fapiClient';
import { convertPageToOffsetSearchParams } from '@/utils/convertPageToOffsetSearchParams';

import { APIKey, BaseResource } from '../../resources/internal';

export class APIKeys implements APIKeysNamespace {
  static readonly #pathRoot = '/api_keys';

  /**
   * Returns the base options for the FAPI proxy requests.
   */
  async #getBaseFapiProxyOptions(): Promise<FapiRequestInit> {
    const token = await BaseResource.clerk.session?.getToken();
    if (!token) {
      throw new ClerkRuntimeError('No valid session token available', { code: 'no_session_token' });
    }

    return {
      // Set to an empty string because FAPI Proxy does not include the version in the path.
      pathPrefix: '',
      // FAPI Proxy looks for the session token in the Authorization header.
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Set to `same-origin` to ensure cookies and credentials are sent with requests, avoiding CORS issues.
      credentials: 'same-origin',
    };
  }

  /**
   * Retrieves a paginated list of API keys.
   *
   * The subject (owner) is resolved in the following order:
   * 1. Explicit `subject` param (user or organization ID)
   * 2. Active organization ID
   * 3. Current user ID
   */
  async getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>> {
    return BaseResource._fetch({
      ...(await this.#getBaseFapiProxyOptions()),
      method: 'GET',
      path: APIKeys.#pathRoot,
      search: convertPageToOffsetSearchParams({
        ...params,
        subject: params?.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
        query: params?.query ?? '',
      }),
    }).then(res => {
      const { data: apiKeys, total_count } = res as unknown as ClerkPaginatedResponse<ApiKeyJSON>;

      return {
        total_count,
        data: apiKeys.map(apiKey => new APIKey(apiKey)),
      };
    });
  }

  async create(params: CreateAPIKeyParams): Promise<APIKeyResource> {
    const json = (await BaseResource._fetch<ApiKeyJSON>({
      ...(await this.#getBaseFapiProxyOptions()),
      path: APIKeys.#pathRoot,
      method: 'POST',
      body: JSON.stringify({
        type: 'api_key',
        name: params.name,
        subject: params.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
        description: params.description,
        seconds_until_expiration: params.secondsUntilExpiration,
      }),
    })) as unknown as ApiKeyJSON;

    return new APIKey(json);
  }

  async revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource> {
    const json = (await BaseResource._fetch<ApiKeyJSON>({
      ...(await this.#getBaseFapiProxyOptions()),
      method: 'POST',
      path: `${APIKeys.#pathRoot}/${params.apiKeyID}/revoke`,
      body: JSON.stringify({
        revocation_reason: params.revocationReason,
      }),
    })) as unknown as ApiKeyJSON;

    return new APIKey(json);
  }
}
