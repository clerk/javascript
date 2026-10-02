export type ConnectedAccountActionResult = 'redirecting' | void;

export interface ConnectedAccountProviderDisplay {
  provider: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
}

export interface UserProfileConnectionProvider extends ConnectedAccountProviderDisplay {
  id: string;
  connectError?: string;
}

export interface UserProfileConnectedAccount extends ConnectedAccountProviderDisplay {
  id: string;
  identifier?: string;
  status: 'connected' | 'reconnect' | 'error';
  verificationError?: string;
  reconnectError?: string;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  fallbackFocus?: () => HTMLElement | null;
  accounts: UserProfileConnectedAccount[];
  availableProviders?: UserProfileConnectionProvider[];
  pendingId?: string;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export class ConnectedAccountActionError extends Error {
  constructor(
    readonly code: 'unavailable' | 'missing_verification_url',
    message: string = code,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ConnectedAccountActionError';
  }
}
