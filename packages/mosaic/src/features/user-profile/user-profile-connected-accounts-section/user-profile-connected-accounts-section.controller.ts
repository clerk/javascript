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
  const { pendingId, errors, run } = usePendingAction(messages.errors.generic);

  const connect = (id: string, action: (id: string) => Promise<ConnectedAccountActionResult>) =>
    run(id, async () => {
      if ((await action(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, OAUTH_REDIRECT_HOLD_MS));
      }
    });

  return {
    accounts: accounts.map(account =>
      errors[account.id] ? { ...account, reconnectError: errors[account.id] } : account,
    ),
    availableProviders: availableProviders.map(provider =>
      errors[provider.id] ? { ...provider, connectError: errors[provider.id] } : provider,
    ),
    pendingId,
    onConnect: id => void connect(id, onConnect),
    onReconnect: id => void connect(id, onReconnect),
  };
}
