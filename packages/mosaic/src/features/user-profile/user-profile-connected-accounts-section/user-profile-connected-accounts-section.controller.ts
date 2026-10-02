import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import { useErrorText, useMessages } from '../../../localization';
import { toLocalizableError } from '../../../utils/form-error';
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

const OAUTH_REDIRECT_HOLD_MS = 2000;

export function useUserProfileConnectedAccountsController({
  accounts,
  availableProviders,
  onConnect,
  onReconnect,
}: UserProfileConnectedAccountsControllerOptions): UserProfileConnectedAccountsController {
  const messages = useMessages('userProfileConnectedAccounts');
  const errorText = useErrorText();
  const [pendingId, setPendingId] = useState<string>();
  const [errors, setErrors] = useState<Record<string, LocalizableError>>({});
  const connecting = useRef(false);

  const run = async (id: string, action: (id: string) => Promise<ConnectedAccountActionResult>) => {
    if (connecting.current) {
      return;
    }
    connecting.current = true;
    setPendingId(id);
    setErrors(({ [id]: _cleared, ...rest }) => rest);

    try {
      if ((await action(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, OAUTH_REDIRECT_HOLD_MS));
      }
    } catch (error) {
      setErrors(current => ({ ...current, [id]: toLocalizableError(error) }));
    } finally {
      connecting.current = false;
      setPendingId(undefined);
    }
  };

  const errorFor = (id: string) => {
    const error = errors[id];
    return error ? errorText(error, messages.errors.generic) : undefined;
  };

  return {
    accounts: accounts.map(account => {
      const reconnectError = errorFor(account.id);
      return reconnectError ? { ...account, reconnectError } : account;
    }),
    availableProviders: availableProviders.map(provider => {
      const connectError = errorFor(provider.id);
      return connectError ? { ...provider, connectError } : provider;
    }),
    pendingId,
    onConnect: id => void run(id, onConnect),
    onReconnect: id => void run(id, onReconnect),
  };
}
