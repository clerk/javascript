import { ClerkRuntimeError } from '@clerk/shared/error';
import type { Web3Strategy } from '@clerk/shared/types';
import { lazy, Suspense } from 'react';

import { Button, descriptors, Flex, localizationKeys, Spinner } from '@/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/utils/errorHandler';

const Web3SolanaWalletButtons = lazy(() =>
  import(/* webpackChunkName: "web3-solana-wallet-buttons" */ '@/ui/elements/Web3SolanaWalletButtons').then(m => ({
    default: m.Web3SolanaWalletButtons,
  })),
);

export type Web3SelectWalletProps = {
  onConnect: (params: { strategy: Web3Strategy; walletName: string }) => Promise<void>;
};

export const Web3SelectSolanaWalletScreen = ({ onConnect }: Web3SelectWalletProps) => {
  const card = useCardState();
  const { close } = useActionContext();

  const onClick = async ({ walletName }: { walletName: string }) => {
    card.setLoading(walletName);
    try {
      await onConnect({ strategy: 'web3_solana_signature', walletName });
      card.setIdle();
      close();
    } catch (err) {
      card.setIdle();
      if (err instanceof Error) {
        handleError(err, [], card.setError);
      } else {
        const error = new ClerkRuntimeError('An error occurred while generating the Solana signature.', {
          code: 'web3_solana_signature_generation_failed',
          cause: err instanceof Error ? err : undefined,
        });
        handleError(error, [], card.setError);
      }
    }
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('userProfile.start.web3WalletsSection.web3SelectSolanaWalletScreen.title')}
      headerSubtitle={localizationKeys('userProfile.start.web3WalletsSection.web3SelectSolanaWalletScreen.subtitle')}
    >
      <Form.Root>
        <Suspense
          fallback={
            <Flex
              direction={'row'}
              align={'center'}
              justify={'center'}
              sx={t => ({
                height: '100%',
                minHeight: t.sizes.$32,
              })}
            >
              <Spinner
                size={'lg'}
                colorScheme={'primary'}
                elementDescriptor={descriptors.spinner}
              />
            </Flex>
          }
        >
          <Web3SolanaWalletButtons web3AuthCallback={onClick} />
        </Suspense>
        <FormButtonContainer>
          <Button
            type='button'
            variant='ghost'
            onClick={() => {
              close();
            }}
            localizationKey={localizationKeys('userProfile.formButtonReset')}
            elementDescriptor={descriptors.formButtonReset}
          />
        </FormButtonContainer>
      </Form.Root>
    </FormContainer>
  );
};
