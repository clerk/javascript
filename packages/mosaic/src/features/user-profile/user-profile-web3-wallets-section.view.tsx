import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';
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
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileWeb3WalletsSectionView({
  wallets,
  fallbackFocus,
  availableProviders = [],
  onConnect,
  onSetPrimary,
  onRemove,
}: UserProfileWeb3WalletsSectionViewProps) {
  const m = useMessages('userProfileWeb3Wallets');
  const section = useRef<HTMLElement>(null);
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

  return (
    <>
      {hasRows ? (
        <Section.Root
          ref={section}
          tabIndex={-1}
        >
          <Section.Title>{m.title}</Section.Title>
          <Section.Group>
            {wallets.map(wallet => (
              <UserProfileWeb3WalletRowView
                key={wallet.id}
                wallet={wallet}
                triggerRef={removalFocus.registerTrigger(wallet.id)}
                onSetPrimary={onSetPrimary}
                onRemove={onRemove ? wallet => removeWallet.open(wallet) : undefined}
              />
            ))}
            {onConnect
              ? availableProviders.map(provider => (
                  <UserProfileWeb3WalletRowView
                    key={provider.id}
                    wallet={provider}
                    onConnect={onConnect}
                  />
                ))
              : null}
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
