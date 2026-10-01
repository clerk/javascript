import { useRef, useState } from 'react';

import type {
  EnterpriseAccountActionResult,
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

export interface UserProfileEnterpriseAccountsControllerOptions {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  onConnect: (connectionId: string) => Promise<EnterpriseAccountActionResult>;
  formatError: (error: unknown) => string;
}

export interface UserProfileEnterpriseAccountsController {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  pendingConnectionId: string | undefined;
  onConnect: (connectionId: string) => void;
}

export function useUserProfileEnterpriseAccountsController({
  accounts,
  connections,
  onConnect,
  formatError,
}: UserProfileEnterpriseAccountsControllerOptions): UserProfileEnterpriseAccountsController {
  const [pendingConnectionId, setPendingConnectionId] = useState<string>();
  const [connectErrors, setConnectErrors] = useState<Record<string, string>>({});
  const connecting = useRef(false);

  const run = async (id: string) => {
    if (connecting.current) {
      return;
    }
    connecting.current = true;
    setPendingConnectionId(id);
    setConnectErrors(({ [id]: _cleared, ...rest }) => rest);

    try {
      if ((await onConnect(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      setConnectErrors(current => ({ ...current, [id]: formatError(error) }));
    } finally {
      connecting.current = false;
      setPendingConnectionId(undefined);
    }
  };

  return {
    accounts,
    connections: connections.map(connection =>
      connectErrors[connection.id] ? { ...connection, connectError: connectErrors[connection.id] } : connection,
    ),
    pendingConnectionId,
    onConnect: id => void run(id),
  };
}
