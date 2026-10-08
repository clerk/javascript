import { lazy, Suspense } from 'react';

import { Button, descriptors, Flex, localizationKeys, Spinner } from '@/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { useWeb3SelectSolanaWalletController } from './web3-select-solana-wallet.controller';

const Web3SolanaWalletButtons = lazy(() =>
  import(/* webpackChunkName: "web3-solana-wallet-buttons" */ '@/ui/elements/Web3SolanaWalletButtons').then(m => ({
    default: m.Web3SolanaWalletButtons,
  })),
);

export const Web3SelectSolanaWalletView = ({
  onClick,
  close,
}: ReturnType<typeof useWeb3SelectSolanaWalletController>) => {
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
