import * as stylex from '@stylexjs/stylex';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';

import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { styles } from './user-profile-profile-panel.styles';
import { UserProfileProviderIcon } from './user-profile-provider-icon';
import { UserProfileRemoveWeb3WalletDialog } from './user-profile-remove-web3-wallet.dialog';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';
import type {
  UserProfileWeb3Wallet,
  UserProfileWeb3WalletsSectionViewProps,
} from './user-profile-web3-wallets-section.view';

interface UserProfileWeb3WalletRowViewProps extends Pick<
  UserProfileWeb3WalletsSectionViewProps,
  'onConnect' | 'onManage' | 'onSetPrimary' | 'onRemove'
> {
  wallet: UserProfileWeb3Wallet;
  removalFocusRef: RefObject<HTMLElement | null>;
}

export function UserProfileWeb3WalletRowView({
  wallet,
  onConnect,
  onManage,
  onSetPrimary,
  onRemove,
  removalFocusRef,
}: UserProfileWeb3WalletRowViewProps) {
  const [open, setOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const confirmedRemoval = useRef(false);
  const connectRef = useRef<HTMLButtonElement>(null);
  const connected = wallet.connected ?? Boolean(wallet.address);
  const actions: UserProfileMenuAction[] = [];

  const confirmRemove = async () => {
    if (!onRemove || wallet.canRemove === false || removing.current) {
      return;
    }
    removing.current = true;
    confirmedRemoval.current = true;
    setOpen(false);
    try {
      await onRemove(wallet.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : m.removeError);
    } finally {
      removing.current = false;
    }
  };

  if (!wallet.isPrimary && wallet.isVerified !== false && onSetPrimary) {
    actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(wallet.id) });
  }

  if (onRemove && wallet.canRemove !== false) {
    actions.push({
      label: m.remove,
      color: 'negative',
      onClick: () => {
        if (removing.current) {
          return;
        }
        confirmedRemoval.current = false;
        setRemoveError(undefined);
        setOpen(true);
      },
    });
  }
  if (!onSetPrimary && !onRemove && onManage) {
    actions.push({ label: m.manage, onClick: () => onManage(wallet.id) });
  }

  return (
    <Section.Row>
      <Section.Item>
        {wallet.iconUrl ? <UserProfileProviderIcon iconUrl={wallet.iconUrl} /> : null}
        <Section.Content>
          <Section.Label>
            <span {...stylex.props(styles.contactValue)}>
              {wallet.provider}
              {wallet.isPrimary ? <Badge color='neutral'>{m.primary}</Badge> : null}
              {wallet.isVerified === false ? <Badge color='warning'>{m.unverified}</Badge> : null}
            </span>
          </Section.Label>
          {wallet.address ? (
            <Section.Description>
              {wallet.address.length <= 10
                ? wallet.address
                : `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
            </Section.Description>
          ) : null}
          {removeError ? <Section.Error role='alert'>{removeError}</Section.Error> : null}
        </Section.Content>
        <Section.Actions>
          {connected ? (
            <UserProfileActionMenu
              actions={actions}
              label={`${m.manage} ${wallet.provider}`}
            >
              {onRemove && wallet.canRemove !== false ? (
                <UserProfileRemoveWeb3WalletDialog
                  provider={wallet.provider}
                  address={wallet.address}
                  open={open}
                  onOpenChange={setOpen}
                  onConfirm={() => void confirmRemove()}
                  finalFocus={() =>
                    confirmedRemoval.current ? (connectRef.current ?? removalFocusRef.current) : undefined
                  }
                />
              ) : null}
            </UserProfileActionMenu>
          ) : null}
          {!connected && onConnect ? (
            <Button
              ref={connectRef}
              color='neutral'
              size='sm'
              variant='outline'
              onClick={() => onConnect(wallet.id)}
            >
              {m.connect}
              <Icon
                name='arrow-right-top'
                placement='inline-end'
                size='sm'
              />
            </Button>
          ) : null}
        </Section.Actions>
      </Section.Item>
    </Section.Row>
  );
}
