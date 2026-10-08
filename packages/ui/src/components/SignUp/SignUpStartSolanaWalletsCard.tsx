import { withRedirectToAfterSignUp, withRedirectToSignUpTask } from '@/ui/common/withRedirect';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSolanaWalletController } from '../../common/solana-wallet.controller';
import { useSignUpStartSolanaWalletsCardModel } from './sign-up-start-solana-wallets-card.model';
import { SignUpStartSolanaWalletsCardView } from './sign-up-start-solana-wallets-card.view';

const SignUpStartSolanaWalletsCardInner = () => {
  const model = useSignUpStartSolanaWalletsCardModel();
  const controller = useSolanaWalletController(model);

  return <SignUpStartSolanaWalletsCardView {...controller} />;
};

export const SignUpStartSolanaWalletsCard = withRedirectToSignUpTask(
  withRedirectToAfterSignUp(withCardStateProvider(SignUpStartSolanaWalletsCardInner)),
);
