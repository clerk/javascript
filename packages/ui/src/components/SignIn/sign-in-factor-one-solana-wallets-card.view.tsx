import { lazy, Suspense } from 'react';

import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type { useSolanaWalletController } from '../../common/solana-wallet.controller';

const Web3SolanaWalletButtons = lazy(() =>
  import(/* webpackChunkName: "web3-solana-wallet-buttons" */ '@/ui/elements/Web3SolanaWalletButtons').then(m => ({
    default: m.Web3SolanaWalletButtons,
  })),
);

export const SignInFactorOneSolanaWalletsCardView = ({
  requestKey,
  error,
  onBackLinkClick,
  onWeb3Auth,
}: ReturnType<typeof useSolanaWalletController>): JSX.Element => (
  <Flow.Part part='chooseWallet'>
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.web3Solana.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signIn.web3Solana.subtitle')} />
        </Header.Root>
        <Card.Alert>{error}</Card.Alert>
        <Flex
          direction='col'
          gap={4}
        >
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
            <Web3SolanaWalletButtons
              key={requestKey}
              web3AuthCallback={onWeb3Auth}
            />
          </Suspense>
          <BackLink
            boxElementDescriptor={descriptors.backRow}
            linkElementDescriptor={descriptors.backLink}
            onClick={onBackLinkClick}
          />
        </Flex>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  </Flow.Part>
);
