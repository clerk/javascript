import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

// The Connect resources have no Deserializer classes yet, so responses arrive with
// the REST field names.
const camelize = <T>(value: unknown): T => {
  if (Array.isArray(value)) {
    return value.map(item => camelize(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), camelize(item)]),
    ) as T;
  }
  return value as T;
};

export type ConnectConnection = {
  object: 'connection';
  id: string;
  userId: string;
  connector: string;
  key: string;
  scopes: string[];
  status: 'active' | 'needs_attention' | 'disconnected';
  providerAccount: { id: string; label: string | null } | null;
  createdAt: number;
  updatedAt: number;
  disconnectedAt: number | null;
};

export type ConnectConnectionCredential = {
  object: 'connection_credential';
  connectionId: string;
  type: 'oauth';
  accessToken: string;
  tokenType: string;
  expiresAt: number | null;
  grantedScopes: string[];
};

export type ConnectResult =
  | { status: 'complete'; connection: ConnectConnection }
  | { status: 'requires_action'; action: { type: 'redirect'; url: string; expiresAt: number } };

export type ConnectUserParams = {
  userId: string;
  connector: string;
  key?: string;
  scopes?: string[];
  returnUrl: string;
};

export type GetConnectionCredentialParams = {
  userId: string;
  key: string;
  scopes: string[];
  expiresIn?: number;
};

export type ListConnectionsParams = {
  userId?: string;
  connector?: string;
  key?: string;
  status?: ConnectConnection['status'];
  limit?: number;
  offset?: number;
};

type ConnectorParams = Record<string, unknown> & { key: string };

/**
 * @experimental Clerk Connect is in development and the API is subject to change.
 */
export class ConnectConnectorsAPI extends AbstractAPI {
  async create(params: ConnectorParams) {
    return camelize<Record<string, unknown>>(
      await this.request({
        method: 'POST',
        path: '/connectors',
        bodyParams: params,
        options: { deepSnakecaseBodyParamKeys: true },
      }),
    );
  }

  async list(queryParams: { status?: 'active' | 'disabled'; limit?: number; offset?: number } = {}) {
    return camelize<{ data: Record<string, unknown>[]; totalCount: number }>(
      await this.request({ method: 'GET', path: '/connectors', queryParams }),
    );
  }

  async get(connectorIdOrKey: string) {
    this.requireId(connectorIdOrKey);
    return camelize<Record<string, unknown>>(
      await this.request({ method: 'GET', path: joinPaths('/connectors', connectorIdOrKey) }),
    );
  }

  async update(connectorIdOrKey: string, params: Record<string, unknown>) {
    this.requireId(connectorIdOrKey);
    return camelize<Record<string, unknown>>(
      await this.request({
        method: 'PATCH',
        path: joinPaths('/connectors', connectorIdOrKey),
        bodyParams: params,
        options: { deepSnakecaseBodyParamKeys: true },
      }),
    );
  }

  async delete(connectorIdOrKey: string) {
    this.requireId(connectorIdOrKey);
    return camelize<Record<string, unknown>>(
      await this.request({ method: 'DELETE', path: joinPaths('/connectors', connectorIdOrKey) }),
    );
  }
}

/**
 * @experimental Clerk Connect is in development and the API is subject to change.
 */
export class ConnectConnectionsAPI extends AbstractAPI {
  async connect({ userId, ...bodyParams }: ConnectUserParams) {
    this.requireId(userId);
    return camelize<ConnectResult>(
      await this.request({ method: 'POST', path: joinPaths('/users', userId, 'connections'), bodyParams }),
    );
  }

  async list(queryParams: ListConnectionsParams = {}) {
    return camelize<{ data: ConnectConnection[]; totalCount: number }>(
      await this.request({ method: 'GET', path: '/connections', queryParams }),
    );
  }

  async get(connectionId: string) {
    this.requireId(connectionId);
    return camelize<ConnectConnection>(
      await this.request({ method: 'GET', path: joinPaths('/connections', connectionId) }),
    );
  }

  async disconnect(connectionId: string) {
    this.requireId(connectionId);
    return camelize<ConnectConnection>(
      await this.request({ method: 'POST', path: joinPaths('/connections', connectionId, 'disconnect') }),
    );
  }

  async getCredential({ userId, ...bodyParams }: GetConnectionCredentialParams) {
    this.requireId(userId);
    return camelize<ConnectConnectionCredential>(
      await this.request({ method: 'POST', path: joinPaths('/users', userId, 'connection_credentials'), bodyParams }),
    );
  }
}
