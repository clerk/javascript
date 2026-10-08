import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

import { useMfaBackupCodeController } from './mfa-backup-code.controller';
import { MfaBackupCodeView } from './mfa-backup-code.view';
import { useMfaBackupCodeCreateModel } from './mfa-backup-code-create.model';
import { MfaBackupCodeCreateForm } from './MfaBackupCodeCreateForm';

export const MfaBackupCodeScreen = (props: FormProps) => {
  const model = useMfaBackupCodeCreateModel();
  return (
    <MfaBackupCodeContent
      key={model.requestKey}
      {...props}
      model={model}
    />
  );
};

const MfaBackupCodeContent = withCardStateProvider(
  ({ model, ...props }: FormProps & { model: ReturnType<typeof useMfaBackupCodeCreateModel> }) => {
    const controller = useMfaBackupCodeController(model, props);
    return (
      <MfaBackupCodeView
        wizardProps={controller.wizardProps}
        nextStep={controller.nextStep}
        close={controller.close}
        createForm={
          <MfaBackupCodeCreateForm
            model={model}
            onSuccess={controller.onSuccess}
            onReset={controller.onReset}
          />
        }
      />
    );
  },
);
