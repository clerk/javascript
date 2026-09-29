import { getWallets } from '@wallet-standard/core';
import { useEffect, useRef, useState } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { useMessages } from '../../../localization';
import { Reverification, type ReverificationController } from '../../reverification';

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
  reverification,
}: {
  reverification?: ReverificationController;
  open: boolean;
  pending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletName: string) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const [wallets, setWallets] = useState(installedSolanaWallets);
  const [selectedWalletName, setSelectedWalletName] = useState<string>();
  const selectedWallet = useRef<HTMLButtonElement | null>(null);
  const restorePickerFocus = useRef(false);
  const verification =
    reverification?.status === 'ready' ||
    reverification?.status === 'unavailable' ||
    reverification?.status === 'retrying'
      ? reverification
      : undefined;
  const verifying = verification !== undefined;

  useEffect(() => {
    if (verifying) {
      restorePickerFocus.current = true;
    } else if (restorePickerFocus.current && !pending) {
      restorePickerFocus.current = false;
      selectedWallet.current?.focus({ preventScroll: true });
    }
  }, [verifying, pending]);

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
        if (!nextOpen && reverification?.onCancel) {
          reverification.onCancel();
          return;
        }
        if (!nextOpen && (verification || pending)) {
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
          <Flow.Root
            value={verifying ? 'verify' : 'select'}
            direction={verifying ? 1 : -1}
            state={verifying ? 'verify' : 'select'}
          >
            {() => (
              <>
                <Flow.Step ids={['select']}>
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
                        ref={element => {
                          if (selectedWalletName === wallet.name) {
                            selectedWallet.current = element;
                          }
                        }}
                        type='button'
                        variant='outline'
                        color='neutral'
                        fullWidth
                        isPending={pending && selectedWalletName === wallet.name}
                        disabled={pending}
                        onClick={event => {
                          setSelectedWalletName(wallet.name);
                          selectedWallet.current = event.currentTarget;
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
                </Flow.Step>
                <Flow.Step ids={['verify']}>
                  {verification ? (
                    <>
                      <Reverification {...verification} />
                      <Card.Footer>
                        <Button
                          variant='outline'
                          color='neutral'
                          fullWidth
                          disabled={!verification.onCancel}
                          onClick={verification.onCancel}
                        >
                          {m.solanaDialog.back}
                        </Button>
                      </Card.Footer>
                    </>
                  ) : null}
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
