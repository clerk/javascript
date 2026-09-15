import { useMemo } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Section } from '../../components/section';
import { UserProfileWeb3WalletRowView } from './user-profile-web3-wallet-row.view';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';

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
  wallets: UserProfileWeb3Wallet[];
  availableProviders?: UserProfileWeb3Provider[];
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileWeb3WalletsSectionView({
  wallets,
  availableProviders = [],
  onConnect,
  onSetPrimary,
  onRemove,
}: UserProfileWeb3WalletsSectionViewProps) {
  const removeWallet = useMemo(() => Confirmation.createHandle<UserProfileWeb3Wallet>(), []);
  const hasRows = wallets.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));

  return (
    <>
      {hasRows ? (
        <Section.Root>
          <Section.Title>{m.title}</Section.Title>
          <Section.Group>
            {wallets.map(wallet => (
              <UserProfileWeb3WalletRowView
                key={wallet.id}
                wallet={wallet}
                onSetPrimary={onSetPrimary}
                onRequestRemove={onRemove ? wallet => removeWallet.open(wallet) : undefined}
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
          description={describeWalletRemoval}
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          onConfirm={wallet => onRemove(wallet.id)}
        />
      ) : null}
    </>
  );
}

function describeWalletRemoval(wallet: UserProfileWeb3Wallet) {
  return (
    <>
      {m.removeDialog.description.replace('{wallet}', wallet.address)}
      {wallet.isVerified ? (
        <>
          <br />
          <br />
          <span>{m.removeDialog.signInWarning}</span>
        </>
      ) : null}
    </>
  );
}
