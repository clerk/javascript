import { ClerkAPIResponseError, ClerkRuntimeError, errorToJSON, isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  AvailableConnector,
  ClerkPaginatedResponse,
  ConnectNamespace,
  CurrentUserConnection,
  CurrentUserConnectParams,
  CurrentUserConnectResult,
  CurrentUserReauthorizeParams,
  ListAvailableConnectorsParams,
  ListCurrentUserConnectionsParams,
} from '@clerk/shared/types';

import { BaseResource } from '../../resources/internal';

type ConnectorJSON = {
  id: string;
  slug: string;
  display_name: string;
  provider: string | { type: 'custom' };
  scopes: string[];
  scope_labels?: Record<string, string>;
  logo_url: string | null;
  authentication_method?: AvailableConnector['authenticationMethod'];
  api_key?: { instructions: string | null; help_url: string | null } | null;
};

type ConnectionJSON = {
  id: string;
  connector: string;
  connector_display_name?: string | null;
  connector_status?: CurrentUserConnection['connectorStatus'];
  slug: string;
  scopes: string[];
  status: CurrentUserConnection['status'];
  provider_account: { id: string; label: string | null } | null;
  api_key_hint?: string | null;
  created_at: number;
  updated_at: number;
  disconnected_at: number | null;
};

type ConnectResultJSON = {
  status: 'complete' | 'requires_action';
  connection?: ConnectionJSON;
  action?: { type: 'redirect'; url: string; expires_at: number };
};

type ListJSON<T> = { data: T[]; total_count: number };

const toConnector = (json: ConnectorJSON): AvailableConnector => ({
  id: json.id,
  slug: json.slug,
  displayName: json.display_name,
  provider: json.provider,
  scopes: json.scopes,
  scopeLabels: json.scope_labels ?? {},
  logoUrl: json.logo_url,
  authenticationMethod: json.authentication_method ?? 'oauth',
  apiKey: json.api_key ? { instructions: json.api_key.instructions, helpUrl: json.api_key.help_url } : null,
});

const toConnection = (json: ConnectionJSON): CurrentUserConnection => ({
  id: json.id,
  connector: json.connector,
  connectorDisplayName: json.connector_display_name ?? null,
  connectorStatus: json.connector_status ?? 'active',
  slug: json.slug,
  scopes: json.scopes,
  status: json.status,
  providerAccount: json.provider_account,
  apiKeyHint: json.api_key_hint ?? null,
  createdAt: new Date(json.created_at),
  updatedAt: new Date(json.updated_at),
  disconnectedAt: json.disconnected_at === null ? null : new Date(json.disconnected_at),
});

const toConnectResult = (json: ConnectResultJSON): CurrentUserConnectResult => {
  if (json.status === 'complete' && json.connection) {
    return { status: 'complete', connection: toConnection(json.connection) };
  }
  if (json.status === 'requires_action' && json.action) {
    return {
      status: 'requires_action',
      action: { type: 'redirect', url: json.action.url, expiresAt: new Date(json.action.expires_at) },
    };
  }
  throw new Error('Clerk: unexpected Connect response');
};

const unwrap = <T>(json: unknown): T => {
  const payload = json as { response?: T } | null;
  return (payload?.response ?? json) as T;
};

const toSearchParams = (params: Record<string, string | number | undefined> = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });
  return search;
};

const request = async <T>(init: {
  method: 'GET' | 'POST';
  path: string;
  search?: URLSearchParams;
  body?: Record<string, unknown>;
}): Promise<T> => {
  const json = await BaseResource._fetch(init as Parameters<typeof BaseResource._fetch>[0]);
  if (!json) {
    throw new ClerkRuntimeError('Network request failed while offline', { code: 'network_error' });
  }
  return unwrap<T>(json);
};

const list = async <J, T>(
  path: string,
  params: Record<string, string | number | undefined> | undefined,
  convert: (json: J) => T,
): Promise<ClerkPaginatedResponse<T>> => {
  const json = await request<ListJSON<J>>({ method: 'GET', path, search: toSearchParams(params) });
  return { data: json.data.map(convert), total_count: json.total_count };
};

// The API names parameters in snake case. Errors from these calls name the SDK's parameters instead.
const SDK_PARAM_NAMES: Record<string, string> = {
  return_url: 'returnUrl',
  api_key: 'apiKey',
  additional_account: 'additionalAccount',
};
const API_PARAM_PATTERN = new RegExp(`\\b(${Object.keys(SDK_PARAM_NAMES).join('|')})\\b`, 'g');
const toSdkNames = (text: string | undefined) => text?.replace(API_PARAM_PATTERN, name => SDK_PARAM_NAMES[name]);

const withSdkParamNames = (err: unknown): unknown => {
  if (!isClerkAPIResponseError(err)) {
    return err;
  }
  const data = err.errors.map(error => {
    const json = errorToJSON(error);
    return {
      ...json,
      message: toSdkNames(json.message) ?? '',
      long_message: toSdkNames(json.long_message),
      meta: { ...json.meta, param_name: toSdkNames(json.meta?.param_name) },
    };
  });
  return new ClerkAPIResponseError(toSdkNames(err.message) ?? '', {
    data,
    status: err.status,
    clerkTraceId: err.clerkTraceId,
    retryAfter: err.retryAfter,
  });
};

const REAUTHORIZATION_REQUIRED = 'connection_reauthorization_required';

/**
 * @internal
 */
export class Connect implements ConnectNamespace {
  constructor(private readonly navigate: (url: string) => void) {}

  // An incomplete command sends the browser to the provider, as
  // authenticateWithRedirect does. The page is unloading by then, so the
  // promise never settles and no code runs after the caller's await.
  // `redirect: false` returns the action instead.
  private redirectIfRequired = (
    result: CurrentUserConnectResult,
    redirect: boolean | undefined,
  ): Promise<CurrentUserConnectResult> => {
    if (result.status === 'requires_action' && redirect !== false) {
      this.navigate(result.action.url);
      return new Promise<never>(() => {});
    }
    return Promise.resolve(result);
  };

  private command = async (path: string, body: Record<string, unknown>): Promise<CurrentUserConnectResult> => {
    try {
      return toConnectResult(await request<ConnectResultJSON>({ method: 'POST', path, body }));
    } catch (err) {
      throw withSdkParamNames(err);
    }
  };

  connectors = {
    list: (params?: ListAvailableConnectorsParams) => list('/connectors', params, toConnector),
  };

  connections = {
    list: (params?: ListCurrentUserConnectionsParams) => list('/me/connections', params, toConnection),
    get: async (connectionId: string) =>
      toConnection(
        await request<ConnectionJSON>({ method: 'GET', path: `/me/connections/${encodeURIComponent(connectionId)}` }),
      ),
    create: async ({ redirect, ...params }: CurrentUserConnectParams): Promise<CurrentUserConnectResult> => {
      let result: CurrentUserConnectResult;
      try {
        result = await this.command('/me/connections', params);
      } catch (err) {
        // The slug already has a connection to bring back: reauthorize it with the same options.
        const connectionId = isClerkAPIResponseError(err)
          ? err.errors.find(error => error.code === REAUTHORIZATION_REQUIRED)?.meta?.connectionId
          : undefined;
        if (!connectionId) {
          throw err;
        }
        const { returnUrl, scopes, apiKey } = params;
        const reauthorizeParams: CurrentUserReauthorizeParams = { redirect };
        if (returnUrl !== undefined) {
          reauthorizeParams.returnUrl = returnUrl;
        }
        if (scopes !== undefined) {
          reauthorizeParams.scopes = scopes;
        }
        if (apiKey !== undefined) {
          reauthorizeParams.apiKey = apiKey;
        }
        return this.connections.reauthorize(connectionId, reauthorizeParams);
      }
      return this.redirectIfRequired(result, redirect);
    },
    reauthorize: async (
      connectionId: string,
      { redirect, ...params }: CurrentUserReauthorizeParams,
    ): Promise<CurrentUserConnectResult> =>
      this.redirectIfRequired(
        await this.command(`/me/connections/${encodeURIComponent(connectionId)}/reauthorize`, params),
        redirect,
      ),
    disconnect: async (connectionId: string) =>
      toConnection(
        await request<ConnectionJSON>({
          method: 'POST',
          path: `/me/connections/${encodeURIComponent(connectionId)}/disconnect`,
        }),
      ),
  };
}
