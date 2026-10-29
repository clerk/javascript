import { usePendingAction } from '../../../hooks/use-pending-action';
import type { ReverificationController } from '../../reverification';
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
  isDisabled: boolean;
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
    connections: connections.map(connection => ({
      ...connection,
      isPending: actions.pendingKey === connection.id,
      connectError: actions.errorKey === connection.id ? actions.error : undefined,
    })),
    isDisabled: actions.isPending,
    onConnect: id =>
      void actions.run(id, async () => {
        if ((await onConnect(id)) === 'redirecting') {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }),
    connectReverification,
  };
}
