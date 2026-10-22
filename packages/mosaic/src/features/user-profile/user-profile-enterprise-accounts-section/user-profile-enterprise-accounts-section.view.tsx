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
  pendingId?: string;
  onConnect?: (id: string) => void;
  connectionsStatus?: 'ready' | 'loading' | 'unavailable';
}

export function UserProfileEnterpriseAccountsSectionView({
  accounts,
  connections = [],
  pendingId,
  onConnect,
  connectionsStatus = 'ready',
}: UserProfileEnterpriseAccountsSectionViewProps) {
  const m = useMessages('userProfileEnterpriseAccountsSection');
  if (accounts.length === 0 && connections.length === 0 && connectionsStatus === 'ready') {
    return null;
  }
  return (
    <Section.Root>
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
          {connections.map(connection => (
            <UserProfileEnterpriseAccountRowView
              key={connection.id}
              account={connection}
              onConnect={onConnect}
              showConnectDisabled={!onConnect}
              isPending={pendingId === connection.id}
              disabled={pendingId !== undefined || !onConnect}
            />
          ))}
          {connectionsStatus !== 'ready' ? (
            <Section.Item>
              <Section.Content>
                <Section.Description role='status'>
                  {connectionsStatus === 'loading' ? m.connectionsLoading : m.connectionsUnavailable}
                </Section.Description>
              </Section.Content>
            </Section.Item>
          ) : null}
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
