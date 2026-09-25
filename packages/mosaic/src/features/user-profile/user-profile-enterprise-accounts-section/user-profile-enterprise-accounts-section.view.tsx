import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { UserProfileEnterpriseAccountRowView } from './user-profile-enterprise-account-row.view';
import type {
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

export interface UserProfileEnterpriseAccountsSectionViewProps {
  accounts: UserProfileEnterpriseAccount[];
  connections?: UserProfileEnterpriseConnection[];
  pendingConnectionId?: string;
  onConnect?: (id: string) => void;
}

export function UserProfileEnterpriseAccountsSectionView({
  accounts,
  connections = [],
  pendingConnectionId,
  onConnect,
}: UserProfileEnterpriseAccountsSectionViewProps) {
  const m = useMessages('userProfileEnterpriseAccountsSection');
  if (accounts.length === 0 && (connections.length === 0 || !onConnect)) {
    return null;
  }
  return (
    <Section.Root>
      <Section.Title>{m.title}</Section.Title>
      <Section.Group>
        {accounts.map(account => (
          <UserProfileEnterpriseAccountRowView
            key={account.id}
            account={account}
          />
        ))}
        {onConnect
          ? connections.map(connection => (
              <UserProfileEnterpriseAccountRowView
                key={connection.id}
                account={connection}
                onConnect={onConnect}
                isPending={pendingConnectionId === connection.id}
                disabled={pendingConnectionId !== undefined}
              />
            ))
          : null}
      </Section.Group>
    </Section.Root>
  );
}
