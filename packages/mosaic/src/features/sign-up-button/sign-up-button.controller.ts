import { usePendingAction } from '../../hooks/use-pending-action';
import type { SignUpButtonModel } from './sign-up-button.model';

export type SignUpButtonReadyModel = Extract<SignUpButtonModel, { status: 'ready' }>;

export function useSignUpButtonController({ onSignUp }: SignUpButtonReadyModel) {
  const action = usePendingAction();

  return {
    onSignUp: () => void action.run('signUp', onSignUp),
    isPending: action.isPending,
  };
}
