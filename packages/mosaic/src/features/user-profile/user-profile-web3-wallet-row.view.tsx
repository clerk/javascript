import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import { Badge } from '../../components/badge';
import { SubmitButton } from '../../components/button';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { fill, useMessages } from '../../localization';
import { truncationStyles } from '../../styles/typography.styles';
import { styles } from './user-profile-web3-wallets.styles';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';

export function UserProfileWeb3WalletRowView({
  wallet,
  triggerRef,
  isPending = false,
  isDisabled = false,
  onConnect,
  onSetPrimary,
  onRemove,
}: {
  wallet: UserProfileWeb3Wallet | UserProfileWeb3Provider;
  triggerRef?: Ref<HTMLButtonElement>;
  isPending?: boolean;
  isDisabled?: boolean;
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (wallet: UserProfileWeb3Wallet) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const iconUrl = wallet.iconUrl?.trim();
  const linkedWallet = 'address' in wallet ? wallet : undefined;
  const address = linkedWallet?.address;
  const shortAddress = address && (address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`);
  const actions: ActionMenuAction[] = [];

  if (linkedWallet && !linkedWallet.isPrimary && linkedWallet.isVerified && onSetPrimary) {
    actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(wallet.id) });
  }
  if (linkedWallet && onRemove && linkedWallet.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => onRemove(linkedWallet) });
  }

  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        {wallet.provider || iconUrl ? (
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
                  {wallet.provider?.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </IconFrame>
          </Section.Media>
        ) : null}
        <Section.Content>
          <Section.Label>
            <span
              title={wallet.provider || address}
              {...stylex.props(truncationStyles.singleLine, styles.text)}
            >
              {wallet.provider || shortAddress}
            </span>
            {linkedWallet?.isPrimary ? <Badge color='neutral'>{m.primary}</Badge> : null}
            {linkedWallet && !linkedWallet.isVerified ? <Badge color='warning'>{m.unverified}</Badge> : null}
          </Section.Label>
          {wallet.provider && address ? (
            <Section.Description
              xstyle={truncationStyles.singleLine}
              title={address}
            >
              {shortAddress}
            </Section.Description>
          ) : null}
        </Section.Content>
        {onConnect ? (
          <Section.Actions>
            <SubmitButton
              color='neutral'
              size='sm'
              variant='outline'
              isPending={isPending}
              disabled={isDisabled && !isPending}
              aria-label={fill(m.connectLabel, { provider: wallet.provider ?? '' })}
              onClick={() => onConnect(wallet.id)}
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
              actions={actions}
              disabled={isDisabled}
              label={fill(m.manageLabel, { wallet: wallet.provider || address || '' })}
            />
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{'connectError' in wallet ? wallet.connectError : undefined}</Section.Error>
      <Section.Error>{linkedWallet?.primaryError}</Section.Error>
    </Section.Row>
  );
}
