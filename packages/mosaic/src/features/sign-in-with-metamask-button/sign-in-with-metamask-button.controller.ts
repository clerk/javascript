import { usePendingAction } from '../../hooks/use-pending-action';
import type { SignInWithMetamaskButtonModel } from './sign-in-with-metamask-button.model';

export type SignInWithMetamaskButtonReadyModel = Extract<SignInWithMetamaskButtonModel, { status: 'ready' }>;

export function useSignInWithMetamaskButtonController({ onSignIn }: SignInWithMetamaskButtonReadyModel) {
  const action = usePendingAction();

  return {
    onSignIn: () => void action.run('signIn', onSignIn),
    isPending: action.isPending,
  };
}
