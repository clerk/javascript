import { useState } from 'react';

import { Button } from '../components/button';
import { Section } from '../components/section';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';
import { styles } from './user-profile-connected-accounts.styles';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section.view';
import { UserProfileConnectedProviderIcon } from './user-profile-connected-provider-icon';
import { UserProfileRemoveConnectedAccountDialog } from './user-profile-remove-connected-account.dialog';

export function UserProfileConnectedAccountRowView({
  account,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Section.Row>
      <Section.Item>
        <Section.Media size='md'>
          <UserProfileConnectedProviderIcon {...account} />
        </Section.Media>
        <Section.Content>
          <Section.Label
            xstyle={styles.text}
            title={account.provider}
          >
            {account.provider}
          </Section.Label>
          {account.identifier ? (
            <Section.Description
              xstyle={styles.text}
              title={account.identifier}
            >
              {account.identifier}
            </Section.Description>
          ) : null}
        </Section.Content>
        {onRemove && account.canRemove !== false ? (
          <Section.Actions>
            <UserProfileActionMenu
              label={`${m.manage} ${account.provider}`}
              actions={[{ label: m.remove, color: 'negative', onClick: () => setOpen(true) }]}
            >
              <UserProfileRemoveConnectedAccountDialog
                provider={account.provider}
                open={open}
                onOpenChange={setOpen}
                onConfirm={() => onRemove(account.id)}
                isPending={account.isRemoving}
                errorMessage={account.removalError}
              />
            </UserProfileActionMenu>
          </Section.Actions>
        ) : null}
      </Section.Item>
      {account.status === 'reconnect' ? (
        <Section.Description>
          {m.disconnected}{' '}
          {onReconnect ? (
            <Button
              variant='link'
              size='sm'
              onClick={() => onReconnect(account.id)}
            >
              {m.reconnect}
            </Button>
          ) : null}
        </Section.Description>
      ) : null}
      {account.status === 'error' && account.verificationError ? (
        <Section.Error>{account.verificationError}</Section.Error>
      ) : null}
    </Section.Row>
  );
}
