import { useInstalledSolanaWallets } from '@clerk/shared/react/hooks/useInstalledSolanaWallets';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { useMessages } from '../../../localization';

export function UserProfileSolanaWalletDialog({
  open,
  pendingWalletName,
  error,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  pendingWalletName?: string;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletName: string) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const wallets = useInstalledSolanaWallets();
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
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.solanaDialog.title}</Card.Title>
            <Card.Description>{m.solanaDialog.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            {error ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{error}</Banner.Label>
              </Banner.Root>
            ) : null}
            {wallets.length === 0 ? (
              <p>
                {m.solanaDialog.noneAvailable}{' '}
                <a
                  href='https://solana.com/solana-wallets'
                  target='_blank'
                  rel='noreferrer'
                >
                  {m.solanaDialog.findWallet}
                </a>
              </p>
            ) : null}
            {wallets.map(wallet => (
              <SubmitButton
                key={wallet.name}
                type='button'
                variant='outline'
                color='neutral'
                fullWidth
                isPending={pendingWalletName === wallet.name}
                disabled={pending && pendingWalletName !== wallet.name}
                onClick={() => onConnect(wallet.name)}
              >
                {wallet.icon ? (
                  <img
                    src={wallet.icon}
                    alt=''
                    aria-hidden
                    width={20}
                    height={20}
                  />
                ) : null}
                {wallet.name}
              </SubmitButton>
            ))}
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                  disabled={pending}
                >
                  {m.solanaDialog.cancel}
                </Button>
              }
            />
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
