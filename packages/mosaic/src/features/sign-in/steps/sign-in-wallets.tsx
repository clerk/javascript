import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import type { SignInProvider } from '../sign-in.types';

interface SignInWalletsProps {
  wallets: readonly SignInProvider[];
  globalErrorMessage?: string;
  pendingWalletId?: string;
  onSelectWallet: (id: string) => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInWallets({
  wallets,
  globalErrorMessage,
  pendingWalletId,
  onSelectWallet,
  onBack,
  focusRef,
}: SignInWalletsProps) {
  const m = useMessages('signIn');
  const firstRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const pending = Boolean(pendingWalletId);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.wallets.title}</Card.Title>
        <Card.Description>{m.wallets.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <ProviderButtonGroup disabled={pending}>
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
              longLabel={wallet.name}
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
            disabled={pending}
            onClick={onBack}
          >
            {m.back}
          </Button>
        </Text>
      </Card.Content>
    </>
  );
}
