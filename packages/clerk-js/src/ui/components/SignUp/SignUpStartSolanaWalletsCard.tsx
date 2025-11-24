import { useClerk } from '@clerk/shared/react';

import { withRedirectToAfterSignUp, withRedirectToSignUpTask } from '@/ui/common/withRedirect';
import { descriptors, Flex, Flow } from '@/ui/customizables';
import { BackLink } from '@/ui/elements/BackLink';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Web3WalletButtons } from '@/ui/elements/Web3WalletButtons';
import { handleError } from '@/ui/utils/errorHandler';
import { sleep } from '@/ui/utils/sleep';

import { useSignUpContext } from '../../contexts';
import { useRouter } from '../../router';

const SignUpStartSolanaWalletsCardInner = () => {
  const clerk = useClerk();
  const card = useCardState();
  const router = useRouter();
  const ctx = useSignUpContext();

  const onSelect = async ({ walletName }: { walletName: string }) => {
    card.setLoading(walletName);
    try {
      await clerk.authenticateWithWeb3({
        customNavigate: router.navigate,
        redirectUrl: ctx.afterSignUpUrl || '/',
        signUpContinueUrl: '../continue',
        unsafeMetadata: ctx.unsafeMetadata,
        strategy: 'web3_solana_signature',
        // TODO: Add support to pass legalAccepted status
        // legalAccepted: ,
        walletName,
      });
    } catch (err) {
      await sleep(1000);
      handleError(err as Error, [], card.setError);
      card.setIdle();
    }
    await sleep(5000);
    card.setIdle();
  };

  const onBackLinkClick = () => {
    void router.navigate('../');
  };

  return (
    <Flow.Part part='choose-wallet'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title>Sign up with Solana Wallet</Header.Title>
            <Header.Subtitle>Select a wallet below to sign up</Header.Subtitle>
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

export const SignUpStartSolanaWalletsCard = withRedirectToSignUpTask(
  withRedirectToAfterSignUp(withCardStateProvider(SignUpStartSolanaWalletsCardInner)),
);
