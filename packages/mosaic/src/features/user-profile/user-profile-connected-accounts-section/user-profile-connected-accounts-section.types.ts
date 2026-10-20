import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { ReverificationController } from '../../reverification';

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
  accounts: UserProfileConnectedAccount[];
  sectionRef?: Ref<HTMLDivElement>;
  availableProviders?: UserProfileConnectionProvider[];
  pendingId?: string;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfileConnectedAccount>;
  finalFocus?: DialogFocusTarget;
  reconnectReverification?: ReverificationController;
  reconnectFinalFocus?: DialogFocusTarget;
}
