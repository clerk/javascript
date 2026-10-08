import type { InviteMembersModalProps } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';

import { withCardStateProvider } from '@/elements/contexts';

import { useInviteMembersWizardController } from '../OrganizationProfile/invite-members-wizard.controller';
import { useInviteMembersOrganizationModel } from '../OrganizationProfile/invite-members-wizard.model';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersScreen';
import { useInviteMembersModalGuardModel } from './invite-members-modal.model';
import { InviteMembersModalInnerView, InviteMembersModalView } from './invite-members-modal.view';

const InviteMembersModalInner = () => {
  const model = useInviteMembersOrganizationModel();

  if (!model.hasOrganization) {
    return null;
  }

  return (
    <InviteMembersModalContent
      key={model.scopeKey}
      canRun={model.canRun}
    />
  );
};

const InviteMembersModalContent = withCardStateProvider(({ canRun }: { canRun: () => boolean }) => {
  const controller = useInviteMembersWizardController(canRun);
  return (
    <InviteMembersModalInnerView
      controller={controller}
      form={
        <InviteMembersForm
          onSuccess={controller.nextStep}
          hideResetButton
        />
      }
      successMessage={<InvitationsSentMessage />}
    />
  );
});

const InviteMembersModalGuard = ({ children }: PropsWithChildren) => {
  const model = useInviteMembersModalGuardModel();
  return model.allowed ? <>{children}</> : null;
};

export const InviteMembersModal = (_props: InviteMembersModalProps): JSX.Element => (
  <InviteMembersModalView
    Guard={InviteMembersModalGuard}
    content={<InviteMembersModalInner />}
  />
);
