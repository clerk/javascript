import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../localization';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import type { ReverificationController } from '../reverification';
import { ReverificationConfirmation } from '../reverification/reverification-confirmation';
import { UserProfileWeb3WalletRowView } from './user-profile-web3-wallet-row.view';

export interface UserProfileWeb3Provider {
  id: string;
  provider: string;
  iconUrl?: string;
  connectError?: string;
}

export interface UserProfileWeb3Wallet {
  id: string;
  address: string;
  provider?: string;
  iconUrl?: string;
  isPrimary?: boolean;
  isVerified: boolean;
  canRemove?: boolean;
  primaryError?: string;
}

export interface UserProfileWeb3WalletsSectionViewProps {
  fallbackFocus?: () => HTMLElement | null;
  wallets: UserProfileWeb3Wallet[];
  availableProviders?: UserProfileWeb3Provider[];
  pendingId?: string;
  removeReverification?: ReverificationController;
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileWeb3WalletsSectionView({
  wallets,
  fallbackFocus,
  availableProviders = [],
  pendingId,
  onConnect,
  onSetPrimary,
  onRemove,
  removeReverification,
}: UserProfileWeb3WalletsSectionViewProps) {
  const m = useMessages('userProfileWeb3Wallets');
  const section = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: wallets.map(wallet => wallet.id),
    onRemove,
    fallback: () =>
      section.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ??
      section.current ??
      fallbackFocus?.() ??
      null,
  });
  const removeWallet = useMemo(() => Confirmation.createHandle<UserProfileWeb3Wallet>(), []);
  const hasRows = wallets.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));
  const isBusy = pendingId !== undefined;

  return (
    <>
      {hasRows ? (
        <Section.Root>
          <Section.Group
            ref={section}
            tabIndex={-1}
          >
            <Section.Header>
              <Section.Content>
                <Section.Title>{m.title}</Section.Title>
              </Section.Content>
            </Section.Header>
            <Section.Body>
              {wallets.map(wallet => (
                <UserProfileWeb3WalletRowView
                  key={wallet.id}
                  wallet={wallet}
                  triggerRef={removalFocus.registerTrigger(wallet.id)}
                  isDisabled={isBusy}
                  onSetPrimary={onSetPrimary}
                  onRemove={onRemove ? wallet => removeWallet.open(wallet) : undefined}
                />
              ))}
              {onConnect
                ? availableProviders.map(provider => (
                    <UserProfileWeb3WalletRowView
                      key={provider.id}
                      wallet={provider}
                      isPending={pendingId === provider.id}
                      isDisabled={isBusy}
                      onConnect={onConnect}
                    />
                  ))
                : null}
            </Section.Body>
          </Section.Group>
        </Section.Root>
      ) : null}
      {onRemove ? (
        <ReverificationConfirmation
          handle={removeWallet}
          reverification={removeReverification}
          title={m.removeDialog.title}
          description={wallet =>
            fill(wallet.isVerified ? m.removeDialog.verifiedDescription : m.removeDialog.description, {
              wallet: truncateWithEndVisible(wallet.address, 13, 4),
            })
          }
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={wallet => removalFocus.remove(wallet.id)}
        />
      ) : null}
    </>
  );
}
