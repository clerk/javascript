import { CardStateProvider } from '@/ui/elements/contexts';

import type { LocalizationKey } from '../../localization';
import { useInviteMembersFormController } from './invite-members-form.controller';
import { useInviteMembersFormModel } from './invite-members-form.model';
import { InviteMembersFormView } from './invite-members-form.view';

type InviteMembersFormProps = {
  onSuccess?: () => void;
  onReset?: () => void;
  primaryButtonLabel?: LocalizationKey;
  resetButtonLabel?: LocalizationKey;
  /**
   * The standalone invite-members modal is dismissed with the modal's close button rather than a
   * cancel action, so it hides the reset button and drops the leading margin on the controls row.
   */
  hideResetButton?: boolean;
};

export const InviteMembersForm = (props: InviteMembersFormProps) => {
  const model = useInviteMembersFormModel(props.onSuccess);
  if (!model.hasOrganization) {
    return null;
  }

  return (
    <CardStateProvider key={model.scopeKey}>
      <InviteMembersFormContent
        {...props}
        model={model}
      />
    </CardStateProvider>
  );
};

const InviteMembersFormContent = (
  props: InviteMembersFormProps & { model: ReturnType<typeof useInviteMembersFormModel> },
) => {
  const controller = useInviteMembersFormController(props.model);
  return (
    <InviteMembersFormView
      controller={controller}
      onReset={props.onReset}
      resetButtonLabel={props.resetButtonLabel}
      hideResetButton={props.hideResetButton}
    />
  );
};
