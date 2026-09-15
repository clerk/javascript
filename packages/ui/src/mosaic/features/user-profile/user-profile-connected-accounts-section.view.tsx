import { useMemo } from 'react';

import { Confirmation } from '../../blocks/confirmation';
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
}

export interface UserProfileConnectedAccountsSectionViewProps {
  accounts: UserProfileConnectedAccount[];
  availableProviders?: UserProfileConnectionProvider[];
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  availableProviders = [],
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  const removeAccount = useMemo(() => Confirmation.createHandle<UserProfileConnectedAccount>(), []);
  const hasRows = accounts.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));

  return (
    <>
      {hasRows ? (
        <Section.Root>
          <Section.Title>{m.title}</Section.Title>
          <Section.Group>
            {accounts.map(account => (
              <UserProfileConnectedAccountRowView
                key={account.id}
                account={account}
                onReconnect={onReconnect}
                onRemove={onRemove ? account => removeAccount.open(account) : undefined}
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
        </Section.Root>
      ) : null}
      {onRemove ? (
        <Confirmation
          handle={removeAccount}
          title={m.removeDialog.title}
          description={account => m.removeDialog.description.replace('{provider}', account.provider)}
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          onConfirm={account => onRemove(account.id)}
        />
      ) : null}
    </>
  );
}
