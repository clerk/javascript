import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import { truncateWithEndVisible } from '../../../utils/truncate-text-with-end-visible';
import { UserProfileWeb3WalletRowView } from './user-profile-web3-wallet-row.view';
import type {
  UserProfileWeb3Wallet,
  UserProfileWeb3WalletsSectionViewProps,
} from './user-profile-web3-wallets-section.types';

export function UserProfileWeb3WalletsSectionView({
  wallets,
  fallbackFocus,
  availableProviders = [],
  pendingId,
  onConnect,
  onVerify,
  onSetPrimary,
  onRemove,
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
                  isPending={pendingId === wallet.id}
                  isDisabled={isBusy}
                  onVerify={onVerify}
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
        <Confirmation
          handle={removeWallet}
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
