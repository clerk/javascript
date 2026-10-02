import { useRef, useState } from 'react';

import { useMessages } from '../../../localization';
import type {
  ConnectedAccountActionResult,
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export interface UserProfileConnectedAccountsControllerOptions {
  accounts: UserProfileConnectedAccount[];
  availableProviders: UserProfileConnectionProvider[];
  onConnect: (id: string) => Promise<ConnectedAccountActionResult>;
  onReconnect: (id: string) => Promise<ConnectedAccountActionResult>;
}

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
}: UserProfileConnectedAccountsControllerOptions): UserProfileConnectedAccountsController {
  const messages = useMessages('userProfileConnectedAccounts');
  const [pendingId, setPendingId] = useState<string>();
  const [connectErrors, setConnectErrors] = useState<Record<string, string>>({});
  const [reconnectErrors, setReconnectErrors] = useState<Record<string, string>>({});
  const connecting = useRef(false);

  const run = async (
    id: string,
    action: (id: string) => Promise<ConnectedAccountActionResult>,
    setErrors: typeof setConnectErrors,
  ) => {
    if (connecting.current) {
      return;
    }
    connecting.current = true;
    setPendingId(id);
    setErrors(({ [id]: _cleared, ...rest }) => rest);

    try {
      if ((await action(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      setErrors(current => ({ ...current, [id]: error instanceof Error ? error.message : messages.errors.generic }));
    } finally {
      connecting.current = false;
      setPendingId(undefined);
    }
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
