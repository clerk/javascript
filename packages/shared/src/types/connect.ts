import type { ClerkPaginatedResponse } from './pagination';

export type ConnectionStatus = 'active' | 'needs_attention' | 'disconnected';

/**
 * A connector the current user can connect to. It has no OAuth client settings.
 */
export interface AvailableConnector {
  id: string;
  key: string;
  displayName: string;
  provider: string | { type: 'custom' };
  scopes: string[];
  scopeLabels: Record<string, string>;
  logoUrl: string | null;
}

/**
 * The current user's durable link to a connector. It has no credentials.
 */
export interface CurrentUserConnection {
  id: string;
  connector: string;
  key: string;
  scopes: string[];
  status: ConnectionStatus;
  providerAccount: { id: string; label: string | null } | null;
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
  key?: string;
  status?: ConnectionStatus;
  limit?: number;
  offset?: number;
};

export type CurrentUserConnectParams = {
  connector: string;
  key?: string;
  scopes?: string[];
  returnUrl: string;
  /**
   * Connects another account to a connector the user already uses. Clerk picks the key.
   */
  additionalAccount?: boolean;
};

export type CurrentUserReauthorizeParams = {
  scopes?: string[];
  returnUrl: string;
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
