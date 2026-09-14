import { Banner } from '../components/banner';
import { Section } from '../components/section';
import { UserProfileConnectAccountMenuView } from './user-profile-connect-account-menu.view';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';

export interface UserProfileConnectionProvider {
  id: string;
  provider: string;
  iconUrl?: string;
}

export interface UserProfileConnectedAccount extends UserProfileConnectionProvider {
  identifier?: string;
  canRemove?: boolean;
  status?: 'connected' | 'reconnect' | 'error';
  verificationError?: string;
  isRemoving?: boolean;
  removalError?: string;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  accounts: UserProfileConnectedAccount[];
  availableProviders?: UserProfileConnectionProvider[];
  connectingProviderId?: string;
  errorMessage?: string;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  availableProviders = [],
  connectingProviderId,
  errorMessage,
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>{m.title}</Section.Title>
      {errorMessage ? (
        <Banner.Root
          role='alert'
          color='negative'
        >
          <Banner.Label>{errorMessage}</Banner.Label>
        </Banner.Root>
      ) : null}
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
          {availableProviders.length > 0 && onConnect ? (
            <Section.Row>
              <Section.Item>
                <Section.Actions>
                  <UserProfileConnectAccountMenuView
                    providers={availableProviders}
                    pendingProviderId={connectingProviderId}
                    onConnect={onConnect}
                  />
                </Section.Actions>
              </Section.Item>
            </Section.Row>
          ) : null}
        </Section.Group>
      ) : null}
    </Section.Root>
  );
}
