import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { SubmitButton } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { ArrowUpRight } from '../../../icons/glyphs/arrow-up-right';
import { fill, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { UserProfileProviderMedia } from '../user-profile-provider-media';
import { styles } from './user-profile-web3-wallets.styles';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.types';

export function UserProfileWeb3WalletRowView({
  wallet,
  triggerRef,
  isPending = false,
  isDisabled = false,
  onConnect,
  onVerify,
  onSetPrimary,
  onRemove,
}: {
  wallet: UserProfileWeb3Wallet | UserProfileWeb3Provider;
  triggerRef?: Ref<HTMLButtonElement>;
  isPending?: boolean;
  isDisabled?: boolean;
  onConnect?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (wallet: UserProfileWeb3Wallet) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const linkedWallet = 'address' in wallet ? wallet : undefined;
  const address = linkedWallet?.address;
  const shortAddress = address && (address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`);
  const actions: ActionMenuAction[] = [];
  const canVerify = Boolean(linkedWallet?.canVerify && onVerify);

  if (linkedWallet && !linkedWallet.isPrimary && linkedWallet.isVerified && onSetPrimary) {
    actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(wallet.id) });
  }
  if (linkedWallet && onRemove && linkedWallet.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => onRemove(linkedWallet) });
  }

  return (
    <Section.Row xstyle={onConnect && styles.connectRow}>
      <Section.Item>
        {wallet.provider ? (
          <UserProfileProviderMedia
            provider={wallet.provider}
            iconUrl={wallet.iconUrl}
            monochromeIcon={wallet.monochromeIcon}
          />
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
            {linkedWallet && !linkedWallet.isVerified ? (
              <Badge color='warning'>{isPending ? m.verifying : m.unverified}</Badge>
            ) : null}
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
        {onConnect || canVerify || actions.length > 0 ? (
          <Section.Actions>
            {onConnect || (canVerify && onVerify) ? (
              <SubmitButton
                ref={triggerRef}
                color='neutral'
                size='sm'
                variant='outline'
                isPending={isPending}
                disabled={isDisabled && !isPending}
                aria-label={fill(onConnect ? m.connectLabel : m.verifyLabel, { provider: wallet.provider ?? '' })}
                onClick={() => (onConnect ?? onVerify)?.(wallet.id)}
              >
                {onConnect ? m.connect : m.verify}
                {onConnect ? (
                  <Icon
                    glyph={ArrowUpRight}
                    placement='inline-end'
                    size='sm'
                  />
                ) : null}
              </SubmitButton>
            ) : null}
            {actions.length > 0 ? (
              <ActionMenu
                triggerRef={canVerify ? undefined : triggerRef}
                actions={actions}
                label={fill(m.manageLabel, { wallet: wallet.provider || address || '' })}
              />
            ) : null}
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Error>{'connectError' in wallet ? wallet.connectError : undefined}</Section.Error>
      <Section.Error>{linkedWallet?.primaryError}</Section.Error>
      <Section.Error>{linkedWallet?.verifyError}</Section.Error>
    </Section.Row>
  );
}
