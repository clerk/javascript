import { useClerk } from '@clerk/shared/react';
import { lazy, Suspense } from 'react';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '@/ui/common/withRedirect';
import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

const Web3SolanaWalletButtons = lazy(() =>
  import(/* webpackChunkName: "web3-wallet-buttons" */ '@/ui/elements/Web3SolanaWalletButtons').then(m => ({
    default: m.Web3SolanaWalletButtons,
  })),
);

import { useSignInContext } from '../../contexts';
import { useRouter } from '../../router';

const SignInFactorOneSolanaWalletsCardInner = () => {
  const clerk = useClerk();
  const card = useCardState();
  const router = useRouter();
  const ctx = useSignInContext();

  const onBackLinkClick = () => {
    void router.navigate('../');
  };

  return (
    <Flow.Part part='chooseWallet'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.web3Solana.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.web3Solana.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
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
                web3AuthCallback={({ walletName }) => {
                  return clerk
                    .authenticateWithWeb3({
                      customNavigate: router.navigate,
                      redirectUrl: ctx.afterSignInUrl || '/',
                      secondFactorUrl: 'factor-two',
                      signUpContinueUrl: ctx.isCombinedFlow ? 'create/continue' : ctx.signUpContinueUrl,
                      strategy: 'web3_solana_signature',
                      walletName,
                    })
                    .catch(err => web3CallbackErrorHandler(err, card.setError));
                }}
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
};

export const SignInFactorOneSolanaWalletsCard = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneSolanaWalletsCardInner)),
);
