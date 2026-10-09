import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Icon, IconFrame } from '../../../components/icon';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { styles } from './user-profile-connected-accounts-section.styles';
import type {
  ConnectedAccountProviderDisplay,
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

function ProviderMedia({ provider }: { provider: ConnectedAccountProviderDisplay }) {
  const iconUrl = provider.iconUrl?.trim();
  return (
    <Section.Media size='lg'>
      <IconFrame>
        {iconUrl && provider.monochromeIcon ? (
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
            {provider.provider.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </IconFrame>
    </Section.Media>
  );
}

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
        <ProviderMedia provider={provider} />
        <Section.Content>
          <Section.Label>
            <span
              title={provider.provider}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {provider.provider}
            </span>
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
        <ProviderMedia provider={account} />
        <Section.Content>
          <Section.Label>
            <span
              title={account.provider}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {account.provider}
            </span>
            {account.status === 'reconnect' ? <Badge color='warning'>{m.disconnected}</Badge> : null}
          </Section.Label>
          <Section.CollapsibleDescription
            truncate
            title={account.identifier}
          >
            {account.identifier}
          </Section.CollapsibleDescription>
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
