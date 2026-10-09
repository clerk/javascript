import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Icon, IconFrame } from '../../../components/icon';
import { Section } from '../../../components/section';
import type { MosaicMessages } from '../../../localization';
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

function accountActions({
  account,
  m,
  isDisabled,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  m: MosaicMessages['userProfileConnectedAccounts'];
  isDisabled: boolean;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}): ActionMenuAction[] {
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
  return actions;
}

export function UserProfileConnectedAccountRowView({
  account,
  provider,
  triggerRef,
  isPending = false,
  isDisabled = false,
  onConnect,
  onReconnect,
  onRemove,
}: {
  account?: UserProfileConnectedAccount;
  provider?: UserProfileConnectionProvider;
  triggerRef?: Ref<HTMLButtonElement>;
  isPending?: boolean;
  isDisabled?: boolean;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  const display = account ?? provider;
  if (!display) {
    return null;
  }
  const actions = account ? accountActions({ account, m, isDisabled, onReconnect, onRemove }) : [];

  return (
    <Section.Row xstyle={account ? undefined : styles.connectRow}>
      <Section.Item>
        <ProviderMedia provider={display} />
        <Section.Content>
          <Section.Label>
            <span
              title={display.provider}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {display.provider}
            </span>
            {account?.status === 'reconnect' ? <Badge color='warning'>{m.disconnected}</Badge> : null}
          </Section.Label>
          <Section.CollapsibleDescription
            truncate
            title={account?.identifier}
          >
            {account?.identifier}
          </Section.CollapsibleDescription>
        </Section.Content>
        {account ? (
          actions.length > 0 ? (
            <Section.Actions>
              <ActionMenu
                triggerRef={triggerRef}
                label={fill(m.manageLabel, { provider: account.provider })}
                actions={actions}
              />
            </Section.Actions>
          ) : null
        ) : provider && onConnect ? (
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
        ) : null}
      </Section.Item>
      <Section.Error>{provider?.connectError}</Section.Error>
      <Section.Error>{account?.reconnectError}</Section.Error>
      <Section.Error>{account?.status === 'error' ? account.verificationError : undefined}</Section.Error>
    </Section.Row>
  );
}
