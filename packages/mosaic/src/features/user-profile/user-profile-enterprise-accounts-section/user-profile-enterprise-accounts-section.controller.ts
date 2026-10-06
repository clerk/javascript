import { useRef, useState } from 'react';

import type { ErrorDescription } from '../../../localization';
import { useErrorText } from '../../../localization';
import { toLocalizableError } from '../../../utils/errors';
import type {
  EnterpriseAccountActionResult,
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

export interface UserProfileEnterpriseAccountsControllerOptions {
  accounts: UserProfileEnterpriseAccount[];
  connections: UserProfileEnterpriseConnection[];
  onConnect: (connectionId: string) => Promise<EnterpriseAccountActionResult>;
  errorFallback: string;
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
  errorFallback,
}: UserProfileEnterpriseAccountsControllerOptions): UserProfileEnterpriseAccountsController {
  const [pendingId, setPendingId] = useState<string>();
  const errorText = useErrorText();
  const [connectErrors, setConnectErrors] = useState<Record<string, ErrorDescription>>({});
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
      setConnectErrors(current => ({ ...current, [id]: toLocalizableError(error) }));
    } finally {
      connecting.current = false;
      setPendingId(undefined);
    }
  };

  return {
    accounts,
    connections: connections.map(connection => {
      const error = connectErrors[connection.id];
      return error ? { ...connection, connectError: errorText(error, errorFallback) } : connection;
    }),
    pendingId,
    onConnect: id => void run(id),
  };
}
