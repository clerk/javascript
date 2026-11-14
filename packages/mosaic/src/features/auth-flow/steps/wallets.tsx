import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Link } from '../../../components/link';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { fill, rich, useMessages } from '../../../localization';
import { styles } from '../auth-flow.styles';
import type { AuthFlowProvider } from '../auth-flow.types';

interface WalletsChoiceProps {
  wallets: readonly AuthFlowProvider[];
  globalErrorMessage?: string;
  pendingWalletId?: string;
  isDisabled: boolean;
  onSelectWallet: (id: string) => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function WalletsChoice({
  wallets,
  globalErrorMessage,
  pendingWalletId,
  isDisabled,
  onSelectWallet,
  onBack,
  focusRef,
  title,
  description,
  loading = false,
}: WalletsChoiceProps) {
  const m = useMessages('signIn');
  const firstRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{title ?? m.wallets.title}</Card.Title>
        <Card.Description>{description ?? m.wallets.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage ??
          (!loading && wallets.length === 0
            ? rich(m.wallets.noneAvailable, {
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
            <Spinner label={m.loading} />
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
              longLabel={wallets.length === 1 ? fill(m.wallets.continueWith, { wallet: wallet.name }) : wallet.name}
              shortLabel={wallet.name}
              isPending={pendingWalletId === wallet.id}
              pendingLabel={m.verifying}
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
            {m.back}
          </Button>
        </Text>
      </Card.Content>
    </>
  );
}
