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
import { styles } from './user-profile-web3-wallets.styles';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.types';

export function UserProfileWeb3WalletRowView({
  wallet,
  provider,
  triggerRef,
  isPending = false,
  isDisabled = false,
  onConnect,
  onSetPrimary,
  onRemove,
}: {
  wallet?: UserProfileWeb3Wallet;
  provider?: UserProfileWeb3Provider;
  triggerRef?: Ref<HTMLButtonElement>;
  isPending?: boolean;
  isDisabled?: boolean;
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (wallet: UserProfileWeb3Wallet) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const name = wallet?.provider || provider?.provider;
  const iconUrl = (wallet?.iconUrl ?? provider?.iconUrl)?.trim();
  const address = wallet?.address;
  const shortAddress = address && (address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`);
  const actions: ActionMenuAction[] = [];

  if (wallet && !wallet.isPrimary && wallet.isVerified && onSetPrimary) {
    actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(wallet.id) });
  }
  if (wallet && onRemove && wallet.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => onRemove(wallet) });
  }

  return (
    <Section.Row xstyle={wallet ? undefined : styles.connectRow}>
      <Section.Item>
        {name || iconUrl ? (
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
                  {name?.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </IconFrame>
          </Section.Media>
        ) : null}
        <Section.Content>
          <Section.Label>
            <span
              title={name || address}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {name || shortAddress}
            </span>
            {wallet?.isPrimary ? <Badge color='neutral'>{m.primary}</Badge> : null}
            {wallet && !wallet.isVerified ? <Badge color='warning'>{m.unverified}</Badge> : null}
          </Section.Label>
          <Section.CollapsibleDescription
            truncate
            title={address}
          >
            {name && address ? shortAddress : undefined}
          </Section.CollapsibleDescription>
        </Section.Content>
        {wallet ? (
          actions.length > 0 ? (
            <Section.Actions>
              <ActionMenu
                triggerRef={triggerRef}
                actions={actions}
                disabled={isDisabled}
                label={fill(m.manageLabel, { wallet: name || address || '' })}
              />
            </Section.Actions>
          ) : null
        ) : provider && onConnect ? (
          <Section.Actions>
            <SubmitButton
              color='neutral'
              size='sm'
              variant='outline'
              isPending={isPending}
              disabled={isDisabled && !isPending}
              aria-label={fill(m.connectLabel, { provider: provider.provider })}
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
      <Section.Error>{wallet?.primaryError}</Section.Error>
    </Section.Row>
  );
}
