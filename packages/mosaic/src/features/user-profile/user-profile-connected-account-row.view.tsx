import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { SubmitButton } from '../../components/button';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { fill, useMessages } from '../../localization';
import { styles } from './user-profile-connected-accounts.styles';
import type { UserProfileConnectedAccount } from './user-profile-connected-accounts-section.view';

export function UserProfileConnectedAccountRowView({
  account,
  triggerRef,
  isPending = false,
  isDisabled = false,
  onConnect,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  triggerRef?: Ref<HTMLButtonElement>;
  isPending?: boolean;
  isDisabled?: boolean;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  const iconUrl = account.iconUrl?.trim();
  const actions: ActionMenuAction[] = [];
  if (account.status === 'reconnect' && onReconnect && !isDisabled) {
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
            {iconUrl && account.monochromeIcon ? (
              <span
                aria-hidden
                {...stylex.props(styles.maskedIcon, styles.maskImage(iconUrl))}
              />
            ) : iconUrl ? (
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
            <SubmitButton
              ref={triggerRef}
              type='button'
              size='sm'
              variant='outline'
              color='neutral'
              aria-label={fill(m.connectLabel, { provider: account.provider })}
              isPending={isPending}
              disabled={isDisabled && !isPending}
              onClick={() => onConnect(account.id)}
            >
              {m.connect}
              <Icon
                name='arrow-up-right'
                placement='inline-end'
                size='sm'
              />
            </SubmitButton>
          </Section.Actions>
        ) : actions.length > 0 ? (
          <Section.Actions>
            <ActionMenu
              triggerRef={triggerRef}
              label={fill(m.manageLabel, { provider: account.provider })}
              actions={actions}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{account.connectError}</Section.Error>
      <Section.Error>{account.reconnectError}</Section.Error>
      <Section.Error>{account.status === 'error' ? account.verificationError : undefined}</Section.Error>
    </Section.Row>
  );
}
