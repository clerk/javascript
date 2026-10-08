import { useCardState } from '@/ui/elements/contexts';

import { useMultisessionController } from '../UserButton/multisession.controller';
import type { useSignInAccountSwitcherModel } from './sign-in-account-switcher.model';

export const useSignInAccountSwitcherController = (model: ReturnType<typeof useSignInAccountSwitcherModel>) => {
  const card = useCardState();
  const actions = useMultisessionController(model.multisession, {});

  return {
    error: card.error,
    sessions: actions.signedInSessions.map(session => ({
      id: session.id,
      preview: session.preview,
      onClick: actions.handleSessionClicked(session.id),
    })),
    onAddAccount: actions.handleAddAccountClicked,
    onSignOutAll: actions.handleSignOutAllClicked,
  };
};
