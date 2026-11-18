import { usePendingAction } from '../../hooks/use-pending-action';
import type { SignInButtonModel } from './sign-in-button.model';

export type SignInButtonReadyModel = Extract<SignInButtonModel, { status: 'ready' }>;

export function useSignInButtonController({ onSignIn }: SignInButtonReadyModel) {
  const action = usePendingAction();

  return {
    onSignIn: () => void action.run('signIn', onSignIn),
    isPending: action.isPending,
  };
}
