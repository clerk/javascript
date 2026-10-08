import { useActionContext } from '@/ui/elements/Action/ActionRoot';

import { useInviteMembersWizardController } from './invite-members-wizard.controller';

export const useInviteMembersScreenController = (canRun: () => boolean, onReset?: () => void) => {
  const { close } = useActionContext();
  const wizard = useInviteMembersWizardController(canRun);

  return { ...wizard, close, onReset: onReset ?? close };
};
