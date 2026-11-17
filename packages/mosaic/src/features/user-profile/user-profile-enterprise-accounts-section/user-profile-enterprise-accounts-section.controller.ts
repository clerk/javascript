import { usePendingAction } from '../../../hooks/use-pending-action';
import type { ReverificationController } from '../../reverification';
import { REDIRECT_HOLD_MS } from '../user-profile.utils';
import type {
  EnterpriseAccountActionResult,
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

export interface UserProfileEnterpriseAccountsControllerOptions {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  onConnect: (connectionId: string) => Promise<EnterpriseAccountActionResult>;
  connectReverification: ReverificationController;
  errorFallback: string;
}

export interface UserProfileEnterpriseAccountsController {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  pendingId: string | undefined;
  onConnect: (connectionId: string) => void;
  connectReverification: ReverificationController;
}

export function useUserProfileEnterpriseAccountsController({
  accounts,
  connections,
  onConnect,
  connectReverification,
  errorFallback,
}: UserProfileEnterpriseAccountsControllerOptions): UserProfileEnterpriseAccountsController {
  const actions = usePendingAction({ errorFallback });

  return {
    accounts,
    connections: connections.map(connection =>
      actions.errorKey === connection.id ? { ...connection, connectError: actions.error } : connection,
    ),
    pendingId: actions.pendingKey,
    onConnect: id =>
      void actions.run(id, async () => {
        if ((await onConnect(id)) === 'redirecting') {
          await new Promise(resolve => setTimeout(resolve, REDIRECT_HOLD_MS));
        }
      }),
    connectReverification,
  };
}
