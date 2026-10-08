import { useMfaBackupCodeListController } from './mfa-backup-code-list.controller';
import type { MfaBackupCodeListProps } from './mfa-backup-code-list.model';
import { useMfaBackupCodeListModel } from './mfa-backup-code-list.model';
import { MfaBackupCodeListView } from './mfa-backup-code-list.view';

export const MfaBackupCodeList = (props: MfaBackupCodeListProps) => {
  const model = useMfaBackupCodeListModel();
  return (
    <MfaBackupCodeListContent
      key={model.requestKey}
      model={model}
      {...props}
    />
  );
};

const MfaBackupCodeListContent = ({
  model,
  ...props
}: MfaBackupCodeListProps & { model: ReturnType<typeof useMfaBackupCodeListModel> }) => {
  const controller = useMfaBackupCodeListController(model, props);

  return <MfaBackupCodeListView controller={controller} />;
};
