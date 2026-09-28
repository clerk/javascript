import { isReverificationCancelledError } from '@clerk/shared/error';
import { useRef, useState } from 'react';

import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '../user-profile-connected-accounts-section.view';

export type ConnectedAccountActionResult = 'redirecting' | void;

export interface UserProfileConnectedAccountsController {
  accounts: UserProfileConnectedAccount[];
  availableProviders: UserProfileConnectionProvider[];
  pendingId: string | undefined;
  onConnect: (id: string) => void;
  onReconnect: (id: string) => void;
}

export function useUserProfileConnectedAccountsController({
  accounts,
  availableProviders,
  onConnect,
  onReconnect,
  fallbackErrorMessage,
}: {
  accounts: UserProfileConnectedAccount[];
  availableProviders: UserProfileConnectionProvider[];
  onConnect: (id: string) => Promise<ConnectedAccountActionResult>;
  onReconnect: (id: string) => Promise<ConnectedAccountActionResult>;
  fallbackErrorMessage: string;
}): UserProfileConnectedAccountsController {
  const [pendingId, setPendingId] = useState<string>();
  const [connectErrors, setConnectErrors] = useState<Record<string, string>>({});
  const [reconnectErrors, setReconnectErrors] = useState<Record<string, string>>({});
  const inFlight = useRef<string | undefined>(undefined);

  const run = async (
    id: string,
    action: (id: string) => Promise<ConnectedAccountActionResult>,
    setErrors: typeof setConnectErrors,
  ) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = id;
    setPendingId(id);
    setErrors(({ [id]: _cleared, ...rest }) => rest);

    try {
      if ((await action(id)) === 'redirecting') {
        return;
      }
    } catch (error) {
      if (!isReverificationCancelledError(error)) {
        const message = error instanceof Error && error.message ? error.message : fallbackErrorMessage;
        setErrors(current => ({ ...current, [id]: message }));
      }
    }

    inFlight.current = undefined;
    setPendingId(undefined);
  };

  return {
    accounts: accounts.map(account =>
      reconnectErrors[account.id] ? { ...account, reconnectError: reconnectErrors[account.id] } : account,
    ),
    availableProviders: availableProviders.map(provider =>
      connectErrors[provider.id] ? { ...provider, connectError: connectErrors[provider.id] } : provider,
    ),
    pendingId,
    onConnect: id => void run(id, onConnect, setConnectErrors),
    onReconnect: id => void run(id, onReconnect, setReconnectErrors),
  };
}
