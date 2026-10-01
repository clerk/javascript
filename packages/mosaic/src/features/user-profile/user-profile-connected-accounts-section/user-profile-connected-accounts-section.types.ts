export type ConnectedAccountActionResult = 'redirecting' | void;

export interface UserProfileConnectionProvider {
  id: string;
  provider: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
  connectError?: string;
}

export interface UserProfileConnectedAccount extends UserProfileConnectionProvider {
  identifier?: string;
  canRemove?: boolean;
  status?: 'connected' | 'reconnect' | 'error';
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
  constructor(readonly code: 'unavailable' | 'missing_verification_url') {
    super(code);
    this.name = 'ConnectedAccountActionError';
  }
}
