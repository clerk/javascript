import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

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

export type ConnectConnectorConfigurationParams = {
  type: 'oauth';
  client: { type: 'customer_managed'; clientId: string; clientSecret?: string };
  protocol?: 'oauth2' | 'oidc';
  metadata?:
    | { type: 'discovery'; discoveryUrl: string }
    | {
        type: 'manual';
        authorizationUrl: string;
        tokenUrl: string;
        refreshTokenUrl?: string;
        revocationUrl?: string;
        userInfoUrl?: string;
        issuer?: string;
        jwksUrl?: string;
      };
  tokenEndpointAuthMethod?: 'client_secret_basic' | 'client_secret_post' | 'none';
  pkce?: 'required' | 'preferred' | 'disabled';
  responseMode?: 'query' | 'form_post';
  scopeSeparator?: 'space' | 'comma';
  authorizationParams?: Record<string, string>;
  tokenParams?: Record<string, string>;
};

export type CreateConnectorParams = {
  key: string;
  provider: string | { type: 'custom' };
  displayName?: string;
  scopes?: string[];
  target?: { url?: string; resourceUris?: string[]; audience?: string };
  configuration: ConnectConnectorConfigurationParams;
};

export type UpdateConnectorParams = Partial<Omit<CreateConnectorParams, 'key' | 'provider'>> & {
  status?: 'active' | 'disabled';
};

export type ConnectConnector = {
  object: 'connector';
  id: string;
  key: string;
  displayName: string;
  provider: string | { type: 'custom' };
  scopes: string[];
  status: 'active' | 'disabled';
  callbackUrl: string;
  connectionCount: number;
  configuration: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
};

/**
 * @experimental Clerk Connect is in development and the API is subject to change.
 */
export class ConnectConnectorsAPI extends AbstractAPI {
  async create(params: CreateConnectorParams) {
    return camelize<ConnectConnector>(
      await this.request({
        method: 'POST',
        path: '/connectors',
        bodyParams: params,
        options: { deepSnakecaseBodyParamKeys: true },
      }),
    );
  }

  async list(queryParams: { status?: 'active' | 'disabled'; limit?: number; offset?: number } = {}) {
    return camelize<{ data: ConnectConnector[]; totalCount: number }>(
      await this.request({ method: 'GET', path: '/connectors', queryParams }),
    );
  }

  async get(connectorIdOrKey: string) {
    this.requireId(connectorIdOrKey);
    return camelize<ConnectConnector>(
      await this.request({ method: 'GET', path: joinPaths('/connectors', connectorIdOrKey) }),
    );
  }

  async update(connectorIdOrKey: string, params: UpdateConnectorParams) {
    this.requireId(connectorIdOrKey);
    return camelize<{
      object: 'connector_update';
      connector: ConnectConnector;
      impact: { connectionsMarkedNeedsAttention: number };
    }>(
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
    return camelize<{ object: 'connector'; id: string; deleted: boolean }>(
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
