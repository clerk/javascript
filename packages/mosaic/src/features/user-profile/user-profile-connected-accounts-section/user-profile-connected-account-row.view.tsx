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
  ConnectedAccountActionEligibility,
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
  onConnect?: (id: string) => void;
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
            disabled={!onConnect || (isDisabled && !isPending)}
            onClick={() => onConnect?.(provider.id)}
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
  eligibility,
  triggerRef,
  isDisabled = false,
  onReconnect,
  onRemove,
}: {
  account: UserProfileConnectedAccount;
  eligibility?: ConnectedAccountActionEligibility;
  triggerRef?: Ref<HTMLButtonElement>;
  isDisabled?: boolean;
  onReconnect?: (id: string) => void;
  onRemove?: (account: UserProfileConnectedAccount) => void;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  const actions: ActionMenuAction[] = [];
  const canShowReconnect =
    eligibility?.canReconnect ??
    (Boolean(onReconnect) && !isDisabled && (account.status === 'reconnect' || account.status === 'error'));
  if (canShowReconnect) {
    const label = account.status === 'reconnect' ? m.reconnect : m.tryAgain;
    actions.push(
      onReconnect && !isDisabled ? { label, onClick: () => onReconnect(account.id) } : { label, disabled: true },
    );
  }
  if (eligibility?.canRemove ?? Boolean(onRemove)) {
    actions.push(
      onRemove
        ? { label: m.remove, color: 'negative', onClick: () => onRemove(account) }
        : { label: m.remove, color: 'negative', disabled: true },
    );
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
          {account.identifier ? (
            <Section.Description
              xstyle={truncationStyles.singleLine}
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
