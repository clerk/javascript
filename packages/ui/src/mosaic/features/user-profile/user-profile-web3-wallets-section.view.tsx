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
  isRemoving?: boolean;
  removalError?: string;
  primaryError?: string;
}

export interface UserProfileWeb3WalletsSectionViewProps {
  wallets: UserProfileWeb3Wallet[];
  availableProviders?: UserProfileWeb3Provider[];
  onConnect?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UserProfileWeb3WalletsSectionView({
  wallets,
  availableProviders = [],
  onConnect,
  onSetPrimary,
  onRemove,
}: UserProfileWeb3WalletsSectionViewProps) {
  return (
    <Section.Root>
      <Section.Title>{m.title}</Section.Title>
      {wallets.length > 0 || (availableProviders.length > 0 && onConnect) ? (
        <Section.Group>
          {wallets.map(wallet => (
            <UserProfileWeb3WalletRowView
              key={wallet.id}
              wallet={wallet}
              onSetPrimary={onSetPrimary}
              onRemove={onRemove}
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
      ) : null}
    </Section.Root>
  );
}
