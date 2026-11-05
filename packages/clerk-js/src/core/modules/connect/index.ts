import { ClerkRuntimeError } from '@clerk/shared/error';
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
  key: string;
  display_name: string;
  provider: string | { type: 'custom' };
  scopes: string[];
  logo_url: string | null;
};

type ConnectionJSON = {
  id: string;
  connector: string;
  key: string;
  scopes: string[];
  status: CurrentUserConnection['status'];
  provider_account: { id: string; label: string | null } | null;
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
  key: json.key,
  displayName: json.display_name,
  provider: json.provider,
  scopes: json.scopes,
  logoUrl: json.logo_url,
});

const toConnection = (json: ConnectionJSON): CurrentUserConnection => ({
  id: json.id,
  connector: json.connector,
  key: json.key,
  scopes: json.scopes,
  status: json.status,
  providerAccount: json.provider_account,
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

/**
 * @internal
 */
export class Connect implements ConnectNamespace {
  connectors = {
    list: (params?: ListAvailableConnectorsParams) => list('/connectors', params, toConnector),
  };

  connections = {
    list: (params?: ListCurrentUserConnectionsParams) => list('/me/connections', params, toConnection),
    get: async (connectionId: string) =>
      toConnection(
        await request<ConnectionJSON>({ method: 'GET', path: `/me/connections/${encodeURIComponent(connectionId)}` }),
      ),
    connect: async (params: CurrentUserConnectParams) =>
      toConnectResult(await request<ConnectResultJSON>({ method: 'POST', path: '/me/connections', body: params })),
    reauthorize: async (connectionId: string, params: CurrentUserReauthorizeParams) =>
      toConnectResult(
        await request<ConnectResultJSON>({
          method: 'POST',
          path: `/me/connections/${encodeURIComponent(connectionId)}/reauthorize`,
          body: params,
        }),
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
