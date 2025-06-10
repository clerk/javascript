import type {
  ApiKeyJSON,
  APIKeyResource,
  APIKeysNamespace,
  CreateAPIKeyParams,
  GetAPIKeysParams,
  RevokeAPIKeyParams,
} from '@clerk/types';

import type { FapiRequestInit } from '@/core/fapiClient';

import { APIKey, BaseResource } from '../../resources/internal';

export class APIKeys implements APIKeysNamespace {
  /**
   * Returns the base options for the FAPI proxy requests.
   */
  private async getBaseFapiProxyOptions(): Promise<FapiRequestInit> {
    return {
      // Set to an empty string because FAPI Proxy does not include the version in the path.
      pathPrefix: '',
      // Set the session token as a Bearer token in the Authorization header for authentication.
      headers: {
        Authorization: `Bearer ${await BaseResource.clerk.session?.getToken()}`,
        'Content-Type': 'application/json',
      },
      // Set to `same-origin` to ensure cookies and credentials are sent with requests, avoiding CORS issues.
      credentials: 'same-origin',
    };
  }

  async getAll(params?: GetAPIKeysParams): Promise<APIKeyResource[]> {
    return BaseResource.clerk
      .getFapiClient()
      .request<{ api_keys: ApiKeyJSON[] }>({
        ...(await this.getBaseFapiProxyOptions()),
        method: 'GET',
        path: '/api_keys',
        search: {
          subject: params?.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
        },
      })
      .then(res => {
        const apiKeysJSON = res.payload as unknown as { api_keys: ApiKeyJSON[] };
        return apiKeysJSON.api_keys.map(json => new APIKey(json));
      })
      .catch(() => []);
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
      })
      .catch(() => '');
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
