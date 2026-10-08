import { withCardStateProvider } from '@/ui/elements/contexts';

import { useInviteMembersScreenController } from './invite-members-screen.controller';
import { InvitationsSentMessageView, InviteMembersScreenView } from './invite-members-screen.view';
import { useInviteMembersOrganizationModel } from './invite-members-wizard.model';
import { InviteMembersForm } from './InviteMembersForm';

type InviteMembersScreenProps = {
  onReset?: () => void;
};

export const InviteMembersScreen = (props: InviteMembersScreenProps) => {
  const model = useInviteMembersOrganizationModel();

  if (!model.hasOrganization) {
    return null;
  }

  return (
    <InviteMembersScreenContent
      key={model.scopeKey}
      {...props}
      canRun={model.canRun}
    />
  );
};

const InviteMembersScreenContent = withCardStateProvider(
  (props: InviteMembersScreenProps & { canRun: () => boolean }) => {
    const controller = useInviteMembersScreenController(props.canRun, props.onReset);
    return (
      <InviteMembersScreenView
        controller={controller}
        form={
          <InviteMembersForm
            onSuccess={controller.nextStep}
            onReset={controller.onReset}
          />
        }
        successMessage={<InvitationsSentMessageView />}
      />
    );
  },
);

export const InvitationsSentMessage = InvitationsSentMessageView;
