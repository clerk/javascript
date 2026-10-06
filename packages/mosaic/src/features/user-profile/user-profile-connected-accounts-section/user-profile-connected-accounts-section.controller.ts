import { usePendingAction } from '../../../hooks/use-pending-action';
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

const OAUTH_REDIRECT_HOLD_MS = 2000;

export function useUserProfileConnectedAccountsController({
  accounts,
  availableProviders,
  onConnect,
  onReconnect,
}: UserProfileConnectedAccountsControllerOptions): UserProfileConnectedAccountsController {
  const messages = useMessages('userProfileConnectedAccounts');
  const actions = usePendingAction({ errorFallback: messages.errors.generic });

  const run = (id: string, action: (id: string) => Promise<ConnectedAccountActionResult>) =>
    void actions.run(id, async () => {
      if ((await action(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, OAUTH_REDIRECT_HOLD_MS));
      }
    });

  return {
    accounts: accounts.map(account =>
      actions.errorKey === account.id ? { ...account, reconnectError: actions.error } : account,
    ),
    availableProviders: availableProviders.map(provider =>
      actions.errorKey === provider.id ? { ...provider, connectError: actions.error } : provider,
    ),
    pendingId: actions.pendingKey,
    onConnect: id => run(id, onConnect),
    onReconnect: id => run(id, onReconnect),
  };
}
