import type {
  ApiKeyJSON,
  APIKeyResource,
  APIKeysNamespace,
  CreateAPIKeyParams,
  GetAPIKeysParams,
  RevokeAPIKeyParams,
} from '@clerk/types';

import { APIKey, BaseResource } from '../../resources/internal';

export class APIKeys implements APIKeysNamespace {
  getAll = async (params?: GetAPIKeysParams): Promise<APIKeyResource[]> => {
    return BaseResource.clerk
      .getFapiClient()
      .request<{ api_keys: ApiKeyJSON[] }>({
        method: 'GET',
        path: '/api_keys',
        pathPrefix: '',
        search: {
          subject: params?.subject ?? BaseResource.clerk.organization?.id ?? BaseResource.clerk.user?.id ?? '',
        },
        headers: {
          Authorization: `Bearer ${await BaseResource.clerk.session?.getToken()}`,
        },
        credentials: 'same-origin',
      })
      .then(res => {
        const apiKeysJSON = res.payload as unknown as { api_keys: ApiKeyJSON[] };
        return apiKeysJSON.api_keys.map(json => new APIKey(json));
      })
      .catch(() => []);
  };

  getSecret = async (id: string): Promise<string> => {
    return BaseResource.clerk
      .getFapiClient()
      .request<{ secret: string }>({
        method: 'GET',
        path: `/api_keys/${id}/secret`,
        credentials: 'same-origin',
        pathPrefix: '',
        headers: {
          Authorization: `Bearer ${await BaseResource.clerk.session?.getToken()}`,
        },
      })
      .then(res => {
        const { secret } = res.payload as unknown as { secret: string };
        return secret;
      })
      .catch(() => '');
  };

  create = async (params: CreateAPIKeyParams): Promise<APIKeyResource> => {
    const json = (
      await BaseResource._fetch<ApiKeyJSON>({
        path: '/api_keys',
        method: 'POST',
        pathPrefix: '',
        headers: {
          Authorization: `Bearer ${await BaseResource.clerk.session?.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
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
  };

  revoke = async (params: RevokeAPIKeyParams): Promise<APIKeyResource> => {
    const json = (
      await BaseResource._fetch<ApiKeyJSON>({
        path: `/api_keys/${params.apiKeyID}/revoke`,
        method: 'POST',
        pathPrefix: '',
        headers: {
          Authorization: `Bearer ${await BaseResource.clerk.session?.getToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          revocation_reason: params.revocationReason,
        }),
      })
    )?.response as ApiKeyJSON;

    return new APIKey(json);
  };
}
