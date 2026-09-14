import { useRef } from 'react';

import { Section } from '../../components/section';
import { UserProfileWeb3WalletRowView } from './user-profile-web3-wallet-row.view';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';

export interface UserProfileWeb3Wallet {
  id: string;
  provider: string;
  address?: string;
  iconUrl?: string;
  connected?: boolean;
  isPrimary?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfileWeb3WalletsSectionViewProps {
  wallets: UserProfileWeb3Wallet[];
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileWeb3WalletsSectionView({
  wallets,
  onConnect,
  onManage,
  onSetPrimary,
  onRemove,
}: UserProfileWeb3WalletsSectionViewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <Section.Root
      ref={sectionRef}
      tabIndex={-1}
    >
      <Section.Title>{m.title}</Section.Title>
      <Section.Group>
        {wallets.map(wallet => (
          <UserProfileWeb3WalletRowView
            key={wallet.id}
            wallet={wallet}
            onConnect={onConnect}
            onManage={onManage}
            onSetPrimary={onSetPrimary}
            onRemove={onRemove}
            removalFocusRef={sectionRef}
          />
        ))}
      </Section.Group>
    </Section.Root>
  );
}
