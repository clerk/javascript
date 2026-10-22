import type {
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from '@clerk/mosaic/features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.types';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosText } from '@/lib/chaos';
import { enterpriseLogos } from '@clerk/mosaic/components/provider-logo/enterprise.generated';

export const accounts: UserProfileEnterpriseAccount[] = [
  {
    id: 'account_okta',
    name: 'Acme Okta',
    emailAddress: 'alex@acme.com',
    icon: { logo: enterpriseLogos.saml_okta },
  },
  { id: 'account_custom', name: 'Internal SSO', emailAddress: 'alex@internal.acme.com', icon: { initial: 'I' } },
];
const connections: UserProfileEnterpriseConnection[] = [
  { id: 'connection_google', name: 'Google Workspace', icon: { logo: enterpriseLogos.saml_google } },
  { id: 'connection_saml', name: 'Partner SAML', icon: { initial: 'P' } },
];

export function useEnterpriseAccountsFixture({
  initialAccounts = accounts,
  initialError,
}: {
  initialAccounts?: UserProfileEnterpriseAccount[];
  initialError?: string;
} = {}) {
  const seedAccounts = useChaosFixture(initialAccounts, items =>
    items.map((account, index) => ({ ...account, name: chaosText(account.name), emailAddress: chaosEmail(index) })),
  );
  const seedConnections = useChaosFixture(connections, items =>
    items.map(connection => ({ ...connection, name: chaosText(connection.name) })),
  );
  const [linkedAccounts, setLinkedAccounts] = useState(seedAccounts);
  const [availableConnections, setAvailableConnections] = useState(
    seedConnections.map((connection, index) => ({
      ...connection,
      connectError: index === 0 ? initialError : undefined,
    })),
  );
  const [pendingId, setPendingId] = useState<string>();

  return {
    accounts: linkedAccounts,
    connections: availableConnections,
    pendingId,
    onConnect: (id: string) => {
      const connection = availableConnections.find(item => item.id === id);
      if (!connection || pendingId) {
        return;
      }
      setPendingId(id);
      setAvailableConnections(current => current.map(item => ({ ...item, connectError: undefined })));
      setTimeout(() => {
        setLinkedAccounts(current => [
          ...current,
          { id: `account_${id}`, name: connection.name, icon: connection.icon, emailAddress: 'alex@acme.com' },
        ]);
        setAvailableConnections(current => current.filter(item => item.id !== id));
        setPendingId(undefined);
      }, 1500);
    },
  };
}
