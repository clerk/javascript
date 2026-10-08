import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '@/ui/common/withRedirect';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSolanaWalletController } from '../../common/solana-wallet.controller';
import { useSignInFactorOneSolanaWalletsCardModel } from './sign-in-factor-one-solana-wallets-card.model';
import { SignInFactorOneSolanaWalletsCardView } from './sign-in-factor-one-solana-wallets-card.view';

const SignInFactorOneSolanaWalletsCardInner = () => {
  const model = useSignInFactorOneSolanaWalletsCardModel();
  const controller = useSolanaWalletController(model);
  return <SignInFactorOneSolanaWalletsCardView {...controller} />;
};

export const SignInFactorOneSolanaWalletsCard = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneSolanaWalletsCardInner)),
);
