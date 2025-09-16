import type {
  ApiKeyJSON,
  APIKeyResource,
  APIKeysNamespace,
  ClerkPaginatedResponse,
  CreateAPIKeyParams,
  GetAPIKeysParams,
  RevokeAPIKeyParams,
} from '@clerk/types';

import type { FapiRequestInit } from '@/core/fapiClient';
import { convertPageToOffsetSearchParams } from '@/utils/convertPageToOffsetSearchParams';

import { APIKey, BaseResource, ClerkRuntimeError } from '../../resources/internal';

export class APIKeys implements APIKeysNamespace {
  /**
   * Returns the base options for the FAPI proxy requests.
   */
  private async getBaseFapiProxyOptions(): Promise<FapiRequestInit> {
    const token = await BaseResource.clerk.session?.getToken();
    if (!token) {
      throw new ClerkRuntimeError('No valid session token available', { code: 'no_session_token' });
    }

    return {
      // Set to an empty string because FAPI Proxy does not include the version in the path.
      pathPrefix: '',
      // Set the session token as a Bearer token in the Authorization header for authentication.
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Set to `same-origin` to ensure cookies and credentials are sent with requests, avoiding CORS issues.
      credentials: 'same-origin',
    };
  }

  async getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>> {
    return BaseResource._fetch({
      ...(await this.getBaseFapiProxyOptions()),
      method: 'GET',
      path: '/api_keys',
      search: convertPageToOffsetSearchParams({
        ...params,
        subject: params?.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
      }),
    }).then(res => {
      const { api_keys: apiKeys, total_count } = res as unknown as {
        api_keys: ApiKeyJSON[];
        total_count: number;
      };

      return {
        total_count,
        data: apiKeys.map(apiKey => new APIKey(apiKey)),
      };
    });
  }

  async getSecret(id: string): Promise<string> {
    return BaseResource.clerk
      .getFapiClient()
      .request<{ secret: string }>({
        ...(await this.getBaseFapiProxyOptions()),
        method: 'GET',
        path: `/api_keys/${id}/secret`,
      })
      .then(res => {
        const { secret } = res.payload as unknown as { secret: string };
        return secret;
      });
  }

  async create(params: CreateAPIKeyParams): Promise<APIKeyResource> {
    const json = (
      await BaseResource._fetch<ApiKeyJSON>({
        ...(await this.getBaseFapiProxyOptions()),
        path: '/api_keys',
        method: 'POST',
        body: JSON.stringify({
          type: params.type ?? 'api_key',
          name: params.name,
          subject: params.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
          description: params.description,
          seconds_until_expiration: params.secondsUntilExpiration,
        }),
      })
    )?.response as ApiKeyJSON;

    return new APIKey(json);
  }

  async revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource> {
    const json = (
      await BaseResource._fetch<ApiKeyJSON>({
        ...(await this.getBaseFapiProxyOptions()),
        method: 'POST',
        path: `/api_keys/${params.apiKeyID}/revoke`,
        body: JSON.stringify({
          revocation_reason: params.revocationReason,
        }),
      })
    )?.response as ApiKeyJSON;

    return new APIKey(json);
  }
}
