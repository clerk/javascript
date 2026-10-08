import type { ComponentProps } from 'react';

import { Dialog } from '../../../components/dialog';
import { useUserProfileSolanaWalletsModel } from './user-profile-solana-wallet.model';
import { UserProfileSolanaWalletView } from './user-profile-solana-wallet.view';

type SolanaWalletContentProps = Omit<ComponentProps<typeof UserProfileSolanaWalletView>, 'discovery'>;

export function UserProfileSolanaWalletDialog({
  open,
  pendingWalletName,
  error,
  onOpenChange,
  onConnect,
}: SolanaWalletContentProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pending = pendingWalletName !== undefined;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen && pending) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Popup variant='card'>
        <SolanaWalletContent
          pendingWalletName={pendingWalletName}
          error={error}
          onConnect={onConnect}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function SolanaWalletContent(props: SolanaWalletContentProps) {
  const discovery = useUserProfileSolanaWalletsModel();
  return (
    <UserProfileSolanaWalletView
      {...props}
      discovery={discovery}
    />
  );
}
