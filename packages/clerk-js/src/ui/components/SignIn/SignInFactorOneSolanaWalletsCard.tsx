import { useClerk } from '@clerk/shared/react';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '@/ui/common/withRedirect';
import { descriptors, Flex, Flow } from '@/ui/customizables';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Web3WalletButtons } from '@/ui/elements/Web3WalletButtons';
import { handleError } from '@/ui/utils/errorHandler';

import { useSignInContext } from '../../contexts';
import { useRouter } from '../../router';

const SignInFactorOneSolanaWalletsCardInner = () => {
  const clerk = useClerk();
  const card = useCardState();
  const router = useRouter();
  const ctx = useSignInContext();

  const onSelect = async ({ walletName }: { walletName: string }) => {
    card.setLoading(walletName);
    try {
      await clerk.authenticateWithWeb3({
        strategy: 'web3_solana_signature',
        redirectUrl: ctx.afterSignInUrl || '/',
        signUpContinueUrl: ctx.isCombinedFlow ? '../create/continue' : ctx.signUpContinueUrl,
        customNavigate: router.navigate,
        secondFactorUrl: 'factor-two',
        walletName,
      });
    } catch (err) {
      handleError(err as Error, [], card.setError);
      card.setIdle();
    }
  };

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
            <Web3WalletButtons onSelect={onSelect} />

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
