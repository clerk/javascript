import { useWizard } from '@/ui/common';
import type { FormProps } from '@/ui/elements/FormContainer';

import { useActionContext } from '../../elements/Action/ActionRoot';

export const useMfaBackupCodeController = (model: { canRun: () => boolean }, props: FormProps) => {
  const wizard = useWizard();
  const { close } = useActionContext();
  return {
    wizardProps: wizard.props,
    nextStep: () => {
      if (model.canRun()) {
        wizard.nextStep();
      }
    },
    close: () => {
      if (model.canRun()) {
        close();
      }
    },
    onSuccess: () => {
      if (model.canRun()) {
        props.onSuccess();
      }
    },
    onReset: () => {
      if (model.canRun()) {
        props.onReset();
      }
    },
  };
};
