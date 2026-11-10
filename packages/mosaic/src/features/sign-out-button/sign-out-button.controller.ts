import { usePendingAction } from '../../hooks/use-pending-action';
import type { SignOutButtonModel } from './sign-out-button.model';

export type SignOutButtonReadyModel = Extract<SignOutButtonModel, { status: 'ready' }>;

export function useSignOutButtonController({ onSignOut }: SignOutButtonReadyModel) {
  const action = usePendingAction();

  return {
    onSignOut: () => void action.run('signOut', onSignOut),
    isPending: action.isPending,
  };
}
