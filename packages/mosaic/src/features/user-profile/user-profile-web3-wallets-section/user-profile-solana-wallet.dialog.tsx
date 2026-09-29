import { getWallets } from '@wallet-standard/core';
import { useEffect, useState } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { useMessages } from '../../../localization';

function installedSolanaWallets() {
  return getWallets()
    .get()
    .filter(
      wallet => wallet.chains.some(chain => chain.startsWith('solana:')) && 'solana:signMessage' in wallet.features,
    );
}

export function UserProfileSolanaWalletDialog({
  open,
  pending,
  error,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  pending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletName: string) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const [wallets, setWallets] = useState(installedSolanaWallets);
  const [selectedWalletName, setSelectedWalletName] = useState<string>();

  useEffect(() => {
    const registry = getWallets();
    const update = () => setWallets(installedSolanaWallets());
    const unregister = registry.on('register', update);
    const unadvertise = registry.on('unregister', update);
    update();
    return () => {
      unregister();
      unadvertise();
    };
  }, []);

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
                isPending={pending && selectedWalletName === wallet.name}
                disabled={pending}
                onClick={() => {
                  setSelectedWalletName(wallet.name);
                  onConnect(wallet.name);
                }}
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
