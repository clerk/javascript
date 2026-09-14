import { Section } from '../../components/section';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';

export interface UserProfileConnectionProvider {
  id: string;
  provider: string;
  iconUrl?: string;
  connectError?: string;
}

export interface UserProfileConnectedAccount extends UserProfileConnectionProvider {
  identifier?: string;
  canRemove?: boolean;
  status?: 'connected' | 'reconnect' | 'error';
  verificationError?: string;
  reconnectError?: string;
  isRemoving?: boolean;
  removalError?: string;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  accounts: UserProfileConnectedAccount[];
  availableProviders?: UserProfileConnectionProvider[];
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  availableProviders = [],
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>{m.title}</Section.Title>
      {accounts.length > 0 || (availableProviders.length > 0 && onConnect) ? (
        <Section.Group>
          {accounts.map(account => (
            <UserProfileConnectedAccountRowView
              key={account.id}
              account={account}
              onReconnect={onReconnect}
              onRemove={onRemove}
            />
          ))}
          {onConnect
            ? availableProviders.map(provider => (
                <UserProfileConnectedAccountRowView
                  key={provider.id}
                  account={provider}
                  onConnect={onConnect}
                />
              ))
            : null}
        </Section.Group>
      ) : null}
    </Section.Root>
  );
}
