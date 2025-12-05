import { useClerk } from '@clerk/shared/react';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '@/ui/common/withRedirect';
import { descriptors, Flex, Flow } from '@/ui/customizables';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Web3WalletButtons } from '@/ui/elements/Web3WalletButtons';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

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
    <Flow.Part part='choose-wallet'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title>Continue with Solana Wallet</Header.Title>
            <Header.Subtitle>Select a wallet below to sign in</Header.Subtitle>
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Flex
            direction='col'
            gap={4}
          >
            <Web3WalletButtons
              web3AuthCallback={({ walletName }) => {
                return clerk
                  .authenticateWithWeb3({
                    customNavigate: router.navigate,
                    redirectUrl: ctx.afterSignInUrl || '/',
                    secondFactorUrl: 'factor-two',
                    signUpContinueUrl: ctx.isCombinedFlow ? '../create/continue' : ctx.signUpContinueUrl,
                    strategy: 'web3_solana_signature',
                    walletName,
                  })
                  .catch(err => web3CallbackErrorHandler(err, card.setError));
              }}
            />

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
