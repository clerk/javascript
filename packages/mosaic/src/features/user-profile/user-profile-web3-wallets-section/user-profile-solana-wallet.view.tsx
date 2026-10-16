import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { useMessages } from '../../../localization';
import type { SolanaWalletDiscovery } from './user-profile-solana-wallet.model';

export function UserProfileSolanaWalletView({
  discovery,
  pendingWalletName,
  error,
  onConnect,
}: {
  discovery: SolanaWalletDiscovery;
  pendingWalletName?: string;
  error?: string;
  onConnect: (walletName: string) => void;
}) {
  const m = useMessages('userProfileWeb3Wallets');
  const pending = pendingWalletName !== undefined;

  return (
    <Card.Root
      elevation='overlay'
      renderBranding={false}
    >
      <Card.Header>
        <Card.Title>{m.solanaDialog.title}</Card.Title>
        <Card.Description>{m.solanaDialog.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {discovery.status === 'error' ? m.solanaDialog.loadError : error}
      </Card.Banner>
      <Card.Content>
        {discovery.status === 'loading' ? <p role='status'>{m.solanaDialog.loading}</p> : null}
        {discovery.status === 'ready' && discovery.wallets.length === 0 ? (
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
        {discovery.status === 'ready'
          ? discovery.wallets.map(wallet => (
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
            ))
          : null}
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
  );
}
