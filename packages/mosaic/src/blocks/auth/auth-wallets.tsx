import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Link } from '../../components/link';
import { ProviderButton, ProviderButtonGroup } from '../../components/provider-button';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { fill, rich } from '../../localization';
import { useFlowAutoFocus } from '../../primitives/flow';
import { styles } from './auth.styles';
import type { AuthProvider } from './auth.types';

export interface AuthWalletsMessages {
  title: string;
  description: string;
  continueWith: string;
  noneAvailable: string;
  backButton: string;
  pendingLabel: string;
  loading: string;
}

interface AuthWalletsProps {
  messages: AuthWalletsMessages;
  wallets: readonly AuthProvider[];
  globalErrorMessage?: string;
  pendingWalletId?: string;
  isDisabled: boolean;
  onSelectWallet: (id: string) => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
  loading?: boolean;
}

export function AuthWallets({
  messages,
  wallets,
  globalErrorMessage,
  pendingWalletId,
  isDisabled,
  onSelectWallet,
  onBack,
  focusRef,
  loading = false,
}: AuthWalletsProps) {
  const firstRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage ??
          (!loading && wallets.length === 0
            ? rich(messages.noneAvailable, {
                components: {
                  link: children => (
                    <Link
                      href='https://solana.com/solana-wallets'
                      target='_blank'
                      rel='noopener noreferrer'
                      color='negative'
                    >
                      {children}
                    </Link>
                  ),
                },
              })
            : undefined)}
      </Card.Banner>
      <Card.Content>
        {loading ? (
          <div {...stylex.props(styles.walletsLoading)}>
            <Spinner label={messages.loading} />
          </div>
        ) : null}
        <ProviderButtonGroup disabled={isDisabled}>
          {wallets.map((wallet, index) => (
            <ProviderButton
              key={wallet.id}
              ref={index === 0 ? firstRef : undefined}
              icon={
                <img
                  src={wallet.iconUrl}
                  alt=''
                  {...stylex.props(styles.providerIcon)}
                />
              }
              longLabel={wallets.length === 1 ? fill(messages.continueWith, { wallet: wallet.name }) : wallet.name}
              shortLabel={wallet.name}
              isPending={pendingWalletId === wallet.id}
              pendingLabel={messages.pendingLabel}
              onClick={() => onSelectWallet(wallet.id)}
            />
          ))}
        </ProviderButtonGroup>
        <Text
          size='sm'
          xstyle={styles.footerText}
        >
          <Button
            type='button'
            size='sm'
            variant='link'
            color='neutral'
            disabled={isDisabled}
            onClick={onBack}
          >
            {messages.backButton}
          </Button>
        </Text>
      </Card.Content>
    </>
  );
}
