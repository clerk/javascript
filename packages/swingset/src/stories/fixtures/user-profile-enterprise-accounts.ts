import type {
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from '@clerk/ui/mosaic/features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.types';
import { useState } from 'react';

export const accounts: UserProfileEnterpriseAccount[] = [
  {
    id: 'account_okta',
    name: 'Acme Okta',
    emailAddress: 'alex@acme.com',
    iconUrl: 'https://img.clerk.com/static/okta.svg',
  },
  { id: 'account_custom', name: 'Internal SSO', emailAddress: 'alex@internal.acme.com' },
];
const connections: UserProfileEnterpriseConnection[] = [
  { id: 'connection_google', name: 'Google Workspace', iconUrl: 'https://img.clerk.com/static/google.svg' },
  { id: 'connection_saml', name: 'Partner SAML' },
];

export function useEnterpriseAccountsFixture({
  initialAccounts = accounts,
  initialError,
}: {
  initialAccounts?: UserProfileEnterpriseAccount[];
  initialError?: string;
} = {}) {
  const [linkedAccounts, setLinkedAccounts] = useState(initialAccounts);
  const [availableConnections, setAvailableConnections] = useState(
    connections.map((connection, index) => ({ ...connection, connectError: index === 0 ? initialError : undefined })),
  );
  const [pendingConnectionId, setPendingConnectionId] = useState<string>();

  return {
    accounts: linkedAccounts,
    connections: availableConnections,
    pendingConnectionId,
    onConnect: (id: string) => {
      const connection = availableConnections.find(item => item.id === id);
      if (!connection || pendingConnectionId) {
        return;
      }
      setPendingConnectionId(id);
      setAvailableConnections(current => current.map(item => ({ ...item, connectError: undefined })));
      setTimeout(() => {
        setLinkedAccounts(current => [
          ...current,
          { id: `account_${id}`, name: connection.name, iconUrl: connection.iconUrl, emailAddress: 'alex@acme.com' },
        ]);
        setAvailableConnections(current => current.filter(item => item.id !== id));
        setPendingConnectionId(undefined);
      }, 1500);
    },
  };
}
