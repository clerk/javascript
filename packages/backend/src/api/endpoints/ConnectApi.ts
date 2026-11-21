import { ClerkAPIResponseError, isClerkAPIResponseError } from '@clerk/shared/error';

import { joinPaths } from '../../util/path';
import type { RequestFunction } from '../request';
import { AbstractAPI } from './AbstractApi';

const PROVIDER_PARAM_KEYS = new Set(['authorization_params', 'token_params', 'authorizationParams', 'tokenParams']);

const convertKeys = (value: unknown, rename: (key: string) => string): unknown => {
  if (Array.isArray(value)) {
    return value.map(item => convertKeys(item, rename));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        rename(key),
        PROVIDER_PARAM_KEYS.has(key) ? item : convertKeys(item, rename),
      ]),
    );
  }
  return value;
};

const camelize = <T>(value: unknown): T =>
  convertKeys(value, key => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())) as T;

const snakeize = <T>(value: T): Record<string, unknown> =>
  convertKeys(value, key => key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)) as Record<string, unknown>;

/**
 * Connect errors say how to fix the problem in their `long_message`, so it becomes
 * `err.message` instead of the HTTP reason ("Conflict", "Not Found").
 */
const withClerkErrorMessage =
  (request: RequestFunction): RequestFunction =>
  async options => {
    try {
      return await request(options);
    } catch (err) {
      const first = isClerkAPIResponseError(err) ? err.errors[0] : undefined;
      const message = first?.longMessage || first?.message;
      if (!isClerkAPIResponseError(err) || !message) {
        throw err;
      }
      const error = new ClerkAPIResponseError(message, {
        data: [],
        status: err.status,
        clerkTraceId: err.clerkTraceId,
        retryAfter: err.retryAfter,
      });
      error.errors = err.errors;
      throw error;
    }
  };

abstract class AbstractConnectAPI extends AbstractAPI {
  constructor(request: RequestFunction) {
    super(withClerkErrorMessage(request));
  }
}

export type ConnectConnection = {
  object: 'connection';
  id: string;
  userId: string;
  connector: string;
  slug: string;
  scopes: string[];
  status: 'active' | 'needs_attention' | 'disconnected';
  providerAccount: { id: string; label: string | null } | null;
  /**
   * The masked end of the stored API key, such as `••••abcd`, for an API key connection.
   */
  apiKeyHint?: string | null;
  createdAt: number;
  updatedAt: number;
  disconnectedAt: number | null;
};

export type ConnectOAuthConnectionCredential = {
  object: 'connection_credential';
  connectionId: string;
  type: 'oauth';
  accessToken: string;
  tokenType: string;
  expiresAt: number | null;
  grantedScopes: string[];
};

export type ConnectApiKeyConnectionCredential = {
  object: 'connection_credential';
  connectionId: string;
  type: 'api_key';
  apiKey: string;
  expiresAt: null;
  grantedScopes: string[];
};

/**
 * The connector decides the type: check `type` before reading `accessToken` or `apiKey`.
 */
export type ConnectConnectionCredential = ConnectOAuthConnectionCredential | ConnectApiKeyConnectionCredential;

export type ConnectResult =
  | { status: 'complete'; connection: ConnectConnection }
  | { status: 'requires_action'; action: { type: 'redirect'; url: string; expiresAt: number } };

export type ConnectUserParams = {
  userId: string;
  connector: string;
  slug?: string;
  scopes?: string[];
  /**
   * Required for OAuth connectors, where the browser returns after authorization.
   */
  returnUrl?: string;
  /**
   * Connect another account through the same connector, under the next free slug such as `github-2`.
   */
  additionalAccount?: boolean;
  /**
   * Stores this key for a connector whose authentication method is `api_key`.
   */
  apiKey?: string;
};

export type ReauthorizeConnectionParams = {
  scopes?: string[];
  /**
   * Required for OAuth connections, where the browser returns after authorization.
   */
  returnUrl?: string;
  /**
   * Replaces the stored key of an API key connection.
   */
  apiKey?: string;
};

export type GetConnectionCredentialParams = {
  userId: string;
  /**
   * Scopes the credential must cover. Omit it to accept whatever the connection was granted. API key connections have no scopes.
   */
  scopes?: string[];
  expiresIn?: number;
  /**
   * The connector slug or ID the connection must belong to. A connection of another connector is not found.
   */
  connector?: string;
} & ({ slug: string; connectionId?: never } | { connectionId: string; slug?: never });

export type ListConnectionsParams = {
  userId?: string;
  connector?: string;
  slug?: string;
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
  tokenRequestContentType?: 'application/x-www-form-urlencoded' | 'application/json';
  authorizationParams?: Record<string, string>;
  tokenParams?: Record<string, string>;
};

export type ConnectApiKeyConfigurationParams = {
  type: 'api_key';
  /**
   * Shown to the user next to the key field, such as where to create the key.
   */
  instructions?: string;
  helpUrl?: string;
};

export type CreateConnectorParams = {
  slug: string;
  provider: string | { type: 'custom' };
  displayName?: string;
  scopes?: string[];
  target?: { url?: string; resourceUris?: string[]; audience?: string };
  configuration: ConnectConnectorConfigurationParams | ConnectApiKeyConfigurationParams;
};

export type UpdateConnectorParams = Partial<Omit<CreateConnectorParams, 'slug' | 'provider' | 'target'>> & {
  status?: 'active' | 'disabled';
  target?: CreateConnectorParams['target'] | null;
};

export type ConnectConnector = {
  object: 'connector';
  id: string;
  slug: string;
  displayName: string;
  provider: string | { type: 'custom' };
  authenticationMethod: 'oauth' | 'api_key';
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
export class ConnectConnectorsAPI extends AbstractConnectAPI {
  async create(params: CreateConnectorParams) {
    return camelize<ConnectConnector>(
      await this.request({
        method: 'POST',
        path: '/connectors',
        bodyParams: snakeize(params),
      }),
    );
  }

  async list(queryParams: { status?: 'active' | 'disabled'; limit?: number; offset?: number } = {}) {
    return camelize<{ data: ConnectConnector[]; totalCount: number }>(
      await this.request({ method: 'GET', path: '/connectors', queryParams }),
    );
  }

  async get(connectorIdOrSlug: string) {
    this.requireId(connectorIdOrSlug);
    return camelize<ConnectConnector>(
      await this.request({ method: 'GET', path: joinPaths('/connectors', connectorIdOrSlug) }),
    );
  }

  async update(connectorIdOrSlug: string, params: UpdateConnectorParams) {
    this.requireId(connectorIdOrSlug);
    return camelize<{
      object: 'connector_update';
      connector: ConnectConnector;
      impact: { connectionsMarkedNeedsAttention: number };
    }>(
      await this.request({
        method: 'PATCH',
        path: joinPaths('/connectors', connectorIdOrSlug),
        bodyParams: snakeize(params),
      }),
    );
  }

  async delete(connectorIdOrSlug: string) {
    this.requireId(connectorIdOrSlug);
    return camelize<{ object: 'connector'; id: string; deleted: boolean }>(
      await this.request({ method: 'DELETE', path: joinPaths('/connectors', connectorIdOrSlug) }),
    );
  }
}

/**
 * @experimental Clerk Connect is in development and the API is subject to change.
 */
export class ConnectConnectionsAPI extends AbstractConnectAPI {
  async create({ userId, ...bodyParams }: ConnectUserParams) {
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

  async reauthorize(connectionId: string, bodyParams: ReauthorizeConnectionParams) {
    this.requireId(connectionId);
    return camelize<ConnectResult>(
      await this.request({ method: 'POST', path: joinPaths('/connections', connectionId, 'reauthorize'), bodyParams }),
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
