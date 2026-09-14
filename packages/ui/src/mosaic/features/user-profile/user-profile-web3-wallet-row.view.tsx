import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { UserProfileRemoveWeb3WalletDialog } from './user-profile-remove-web3-wallet.dialog';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';
import { styles } from './user-profile-web3-wallets.styles';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from './user-profile-web3-wallets-section.view';

export function UserProfileWeb3WalletRowView({
  wallet,
  onConnect,
  onSetPrimary,
  onRemove,
}: {
  wallet: UserProfileWeb3Wallet | UserProfileWeb3Provider;
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const iconUrl = wallet.iconUrl?.trim();
  const linkedWallet = 'address' in wallet ? wallet : undefined;
  const address = linkedWallet?.address;
  const shortAddress = address && (address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`);
  const actions: UserProfileMenuAction[] = [];

  if (linkedWallet && !linkedWallet.isPrimary && linkedWallet.isVerified && onSetPrimary) {
    actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(wallet.id) });
  }
  if (linkedWallet && onRemove && linkedWallet.canRemove !== false) {
    actions.push({ label: m.remove, color: 'negative', onClick: () => setOpen(true) });
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
          <Section.Label xstyle={styles.label}>
            <span title={wallet.provider || address}>{wallet.provider || shortAddress}</span>
            {linkedWallet?.isPrimary ? <Badge color='neutral'>{m.primary}</Badge> : null}
            {linkedWallet && !linkedWallet.isVerified ? <Badge color='warning'>{m.unverified}</Badge> : null}
          </Section.Label>
          {wallet.provider && address ? (
            <Section.Description
              xstyle={styles.text}
              title={address}
            >
              {shortAddress}
            </Section.Description>
          ) : null}
        </Section.Content>
        {onConnect ? (
          <Section.Actions>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              aria-label={`${m.connect} ${wallet.provider}`}
              onClick={() => onConnect(wallet.id)}
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
              actions={actions}
              label={`${m.manage} ${wallet.provider || address}`}
            >
              {linkedWallet && onRemove && linkedWallet.canRemove !== false ? (
                <UserProfileRemoveWeb3WalletDialog
                  address={linkedWallet.address}
                  isVerified={linkedWallet.isVerified}
                  open={open}
                  onOpenChange={setOpen}
                  onConfirm={() => onRemove(wallet.id)}
                  isPending={linkedWallet.isRemoving}
                  errorMessage={linkedWallet.removalError}
                />
              ) : null}
            </UserProfileActionMenu>
          </Section.Actions>
        ) : null}
      </Section.Item>
      {'connectError' in wallet && wallet.connectError ? <Section.Error>{wallet.connectError}</Section.Error> : null}
      {linkedWallet?.primaryError ? <Section.Error>{linkedWallet.primaryError}</Section.Error> : null}
    </Section.Row>
  );
}
