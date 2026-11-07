import type { ClerkPaginatedResponse } from './pagination';

export type ConnectionStatus = 'active' | 'needs_attention' | 'disconnected';

/**
 * How a connector authorizes a user: an OAuth redirect, or an API key the user pastes.
 */
export type ConnectAuthenticationMethod = 'oauth' | 'api_key';

/**
 * A connector the current user can connect to. It has no OAuth client settings.
 */
export interface AvailableConnector {
  id: string;
  slug: string;
  displayName: string;
  provider: string | { type: 'custom' };
  scopes: string[];
  scopeLabels: Record<string, string>;
  logoUrl: string | null;
  authenticationMethod: ConnectAuthenticationMethod;
  /**
   * Help for finding the key, present when `authenticationMethod` is `api_key`.
   */
  apiKey: { instructions: string | null; helpUrl: string | null } | null;
}

/**
 * The current user's durable link to a connector. It has no credentials.
 */
export interface CurrentUserConnection {
  id: string;
  connector: string;
  slug: string;
  scopes: string[];
  status: ConnectionStatus;
  providerAccount: { id: string; label: string | null } | null;
  /**
   * The masked end of the stored API key, such as `••••abcd`, for an API key connection.
   */
  apiKeyHint: string | null;
  createdAt: Date;
  updatedAt: Date;
  disconnectedAt: Date | null;
}

export type CurrentUserConnectResult =
  | { status: 'complete'; connection: CurrentUserConnection }
  | { status: 'requires_action'; action: { type: 'redirect'; url: string; expiresAt: Date } };

export type ListAvailableConnectorsParams = { limit?: number; offset?: number };

export type ListCurrentUserConnectionsParams = {
  connector?: string;
  slug?: string;
  status?: ConnectionStatus;
  limit?: number;
  offset?: number;
};

export type CurrentUserConnectParams = {
  connector: string;
  slug?: string;
  scopes?: string[];
  /**
   * Where the browser returns after an OAuth redirect. API key connectors do not redirect.
   */
  returnUrl?: string;
  /**
   * The key the user pastes, for a connector whose `authenticationMethod` is `api_key`.
   */
  apiKey?: string;
  /**
   * Connects another account to a connector the user already uses. Clerk picks the slug.
   */
  additionalAccount?: boolean;
};

export type CurrentUserReauthorizeParams = {
  scopes?: string[];
  returnUrl?: string;
  /**
   * A replacement key for an API key connection.
   */
  apiKey?: string;
};

/**
 * @experimental Clerk Connect is in development and the API is subject to change.
 */
export interface ConnectNamespace {
  connectors: {
    list: (params?: ListAvailableConnectorsParams) => Promise<ClerkPaginatedResponse<AvailableConnector>>;
  };
  connections: {
    list: (params?: ListCurrentUserConnectionsParams) => Promise<ClerkPaginatedResponse<CurrentUserConnection>>;
    get: (connectionId: string) => Promise<CurrentUserConnection>;
    /**
     * Starts a connection. When the result is `requires_action`, Clerk sends the browser to the provider.
     */
    create: (params: CurrentUserConnectParams) => Promise<CurrentUserConnectResult>;
    /**
     * Asks for consent again, or for more scopes. When the result is `requires_action`, Clerk sends the browser to the provider.
     */
    reauthorize: (connectionId: string, params: CurrentUserReauthorizeParams) => Promise<CurrentUserConnectResult>;
    disconnect: (connectionId: string) => Promise<CurrentUserConnection>;
  };
}
