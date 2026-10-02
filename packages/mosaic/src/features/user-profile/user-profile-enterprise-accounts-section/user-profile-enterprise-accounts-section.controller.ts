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
  errorMessage: string;
}

export interface UserProfileEnterpriseAccountsController {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  pendingId: string | undefined;
  onConnect: (connectionId: string) => void;
}

export function useUserProfileEnterpriseAccountsController({
  accounts,
  connections,
  onConnect,
  errorMessage,
}: UserProfileEnterpriseAccountsControllerOptions): UserProfileEnterpriseAccountsController {
  const [pendingId, setPendingId] = useState<string>();
  const [connectErrors, setConnectErrors] = useState<Record<string, string>>({});
  const connecting = useRef(false);

  const run = async (id: string) => {
    if (connecting.current) {
      return;
    }
    connecting.current = true;
    setPendingId(id);
    setConnectErrors(({ [id]: _cleared, ...rest }) => rest);

    try {
      if ((await onConnect(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      setConnectErrors(current => ({ ...current, [id]: error instanceof Error ? error.message : errorMessage }));
    } finally {
      connecting.current = false;
      setPendingId(undefined);
    }
  };

  return {
    accounts,
    connections: connections.map(connection =>
      connectErrors[connection.id] ? { ...connection, connectError: connectErrors[connection.id] } : connection,
    ),
    pendingId,
    onConnect: id => void run(id),
  };
}
