import { withCardStateProvider } from '@/ui/elements/contexts';

import { useMfaBackupCodeCreateController } from './mfa-backup-code-create.controller';
import type { MfaBackupCodeCreateFormProps } from './mfa-backup-code-create.model';
import { useMfaBackupCodeCreateModel } from './mfa-backup-code-create.model';
import { MfaBackupCodeCreateView } from './mfa-backup-code-create.view';

type Model = ReturnType<typeof useMfaBackupCodeCreateModel>;

export const MfaBackupCodeCreateForm = (props: MfaBackupCodeCreateFormProps & { model?: Model }) => {
  if (props.model) {
    return (
      <MfaBackupCodeCreateContent
        key={props.model.requestKey}
        {...props}
        model={props.model}
      />
    );
  }
  return <MfaBackupCodeCreateStandalone {...props} />;
};

const MfaBackupCodeCreateStandalone = (props: MfaBackupCodeCreateFormProps) => {
  const model = useMfaBackupCodeCreateModel();
  return (
    <MfaBackupCodeCreateContent
      key={model.requestKey}
      {...props}
      model={model}
    />
  );
};

const MfaBackupCodeCreateContent = withCardStateProvider(
  ({ model, ...props }: MfaBackupCodeCreateFormProps & { model: Model }) => {
    const controller = useMfaBackupCodeCreateController(model, props);

    return <MfaBackupCodeCreateView controller={controller} />;
  },
);
