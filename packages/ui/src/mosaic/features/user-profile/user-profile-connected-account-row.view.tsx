import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';
import { styles } from './user-profile-connected-accounts.styles';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section.view';

export function UserProfileConnectedAccountRowView({
  account,
  onConnect,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}) {
  const iconUrl = account.iconUrl?.trim();
  const actions: UserProfileMenuAction[] = [];
  if (account.status === 'reconnect' && onReconnect) {
    actions.push({ label: m.reconnect, onClick: () => onReconnect(account.id) });
  }
  if (onRemove && account.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => onRemove(account) });
  }
  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        <Section.Media size='lg'>
          <IconFrame>
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=''
                aria-hidden
                {...stylex.props(styles.icon)}
              />
            ) : (
              <span
                aria-hidden
                {...stylex.props(styles.fallback)}
              >
                {account.provider.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </IconFrame>
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
        {onConnect ? (
          <Section.Actions>
            <Button
              size='sm'
              variant='outline'
              color='neutral'
              aria-label={m.connectLabel.replace('{provider}', account.provider)}
              onClick={() => onConnect(account.id)}
            >
              {m.connect}
              <Icon
                name='arrow-right-top'
                placement='inline-end'
                size='sm'
              />
            </Button>
          </Section.Actions>
        ) : actions.length > 0 ? (
          <Section.Actions>
            <UserProfileActionMenu
              label={m.manageLabel.replace('{provider}', account.provider)}
              actions={actions}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      {account.connectError ? <Section.Error>{account.connectError}</Section.Error> : null}
      {account.reconnectError ? <Section.Error>{account.reconnectError}</Section.Error> : null}
      {account.status === 'error' && account.verificationError ? (
        <Section.Error>{account.verificationError}</Section.Error>
      ) : null}
    </Section.Row>
  );
}
