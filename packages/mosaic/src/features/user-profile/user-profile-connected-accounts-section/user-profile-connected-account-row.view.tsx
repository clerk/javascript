import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { UserProfileProviderIcon } from '../user-profile-provider-icon';
import { styles } from './user-profile-connected-accounts-section.styles';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export function UserProfileConnectProviderRowView({
  provider,
  isPending,
  isDisabled,
  onConnect,
}: {
  provider: UserProfileConnectionProvider;
  isPending: boolean;
  isDisabled: boolean;
  onConnect: (id: string) => void;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  return (
    <Section.Row xstyle={styles.connectRow}>
      <Section.Item>
        <UserProfileProviderIcon {...provider.icon} />
        <Section.Content>
          <Section.Label xstyle={styles.label}>
            <span title={provider.provider}>{provider.provider}</span>
          </Section.Label>
        </Section.Content>
        <Section.Actions>
          <SubmitButton
            type='button'
            size='sm'
            variant='outline'
            color='neutral'
            aria-label={fill(m.connectLabel, { provider: provider.provider })}
            isPending={isPending}
            disabled={isDisabled && !isPending}
            onClick={() => onConnect(provider.id)}
          >
            {m.connect}
            <Icon
              name='arrow-up-right'
              placement='inline-end'
              size='sm'
            />
          </SubmitButton>
        </Section.Actions>
      </Section.Item>
      <Section.Error>{provider.connectError}</Section.Error>
    </Section.Row>
  );
}

export function UserProfileConnectedAccountRowView({
  account,
  triggerRef,
  isDisabled = false,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  triggerRef?: Ref<HTMLButtonElement>;
  isDisabled?: boolean;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  const actions: ActionMenuAction[] = [];
  if ((account.status === 'reconnect' || account.status === 'error') && onReconnect && !isDisabled) {
    actions.push({
      label: account.status === 'reconnect' ? m.reconnect : m.tryAgain,
      onClick: () => onReconnect(account.id),
    });
  }
  if (onRemove) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => onRemove(account) });
  }
  return (
    <Section.Row>
      <Section.Item>
        <UserProfileProviderIcon {...account.icon} />
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
            <ActionMenu
              triggerRef={triggerRef}
              label={fill(m.manageLabel, { provider: account.provider })}
              actions={actions}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{account.reconnectError}</Section.Error>
      <Section.Error>{account.status === 'error' ? account.verificationError : undefined}</Section.Error>
    </Section.Row>
  );
}
