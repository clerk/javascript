import { useState } from 'react';

import { Badge } from '../components/badge';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
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
  const actions: UserProfileMenuAction[] = [];
  if (account.status === 'reconnect' && onReconnect) {
    actions.push({ label: m.reconnect, onClick: () => onReconnect(account.id) });
  }
  if (onRemove && account.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => setOpen(true) });
  }
  return (
    <Section.Row>
      <Section.Item>
        <Section.Media size='md'>
          <UserProfileConnectedProviderIcon {...account} />
        </Section.Media>
        <Section.Content>
          <Section.Label xstyle={styles.label}>
            <span title={account.provider}>{account.provider}</span>
            {account.status === 'reconnect' ? <Badge color='warning'>{m.disconnected}</Badge> : null}
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
        {actions.length > 0 ? (
          <Section.Actions>
            <UserProfileActionMenu
              label={`${m.manage} ${account.provider}`}
              actions={actions}
            >
              {onRemove && account.canRemove !== false ? (
                <UserProfileRemoveConnectedAccountDialog
                  provider={account.provider}
                  open={open}
                  onOpenChange={setOpen}
                  onConfirm={() => onRemove(account.id)}
                  isPending={account.isRemoving}
                  errorMessage={account.removalError}
                />
              ) : null}
            </UserProfileActionMenu>
          </Section.Actions>
        ) : null}
      </Section.Item>
      {account.reconnectError ? <Section.Error>{account.reconnectError}</Section.Error> : null}
      {account.status === 'error' && account.verificationError ? (
        <Section.Error>{account.verificationError}</Section.Error>
      ) : null}
    </Section.Row>
  );
}
