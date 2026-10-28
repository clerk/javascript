import { ReverificationDialog } from '../../../blocks/reverification';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import { UserProfileEnterpriseAccountRowView } from './user-profile-enterprise-account-row.view';
import type {
  UserProfileEnterpriseAccount,
  UserProfileEnterpriseConnection,
} from './user-profile-enterprise-accounts-section.types';

export interface UserProfileEnterpriseAccountsSectionViewProps {
  accounts: UserProfileEnterpriseAccount[];
  connections?: UserProfileEnterpriseConnection[];
  pendingId?: string;
  onConnect?: (id: string) => void;
  connectReverification?: ReverificationController;
}

export function UserProfileEnterpriseAccountsSectionView({
  accounts,
  connections = [],
  pendingId,
  onConnect,
  connectReverification,
}: UserProfileEnterpriseAccountsSectionViewProps) {
  const m = useMessages('userProfile').enterpriseAccounts;
  if (accounts.length === 0 && (connections.length === 0 || !onConnect)) {
    return null;
  }
  return (
    <>
      <Section.Root search={{ label: m.title }}>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>{m.title}</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body>
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
                    isPending={pendingId === connection.id}
                    disabled={pendingId !== undefined}
                  />
                ))
              : null}
          </Section.Body>
        </Section.Group>
      </Section.Root>
      {connectReverification ? <ReverificationDialog controller={connectReverification} /> : null}
    </>
  );
}
