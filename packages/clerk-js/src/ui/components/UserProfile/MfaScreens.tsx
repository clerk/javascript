import type { VerificationStrategy } from '@clerk/shared/types';

import { useActionContext } from '../../elements/Action/ActionRoot';
import { MfaBackupCodeCreateForm } from './MfaBackupCodeCreateForm';
import { MfaForm } from './MfaForm';
import { RemoveMfaPhoneCodeForm, RemoveMfaTOTPForm } from './RemoveResourceForm';

export const RemoveMfaTOTPScreen = () => {
  const { close } = useActionContext();
  return (
    <RemoveMfaTOTPForm
      onSuccess={close}
      onReset={close}
    />
  );
};

type RemoveMfaPhoneCodeProps = { phoneId: string };
export const RemoveMfaPhoneCodeScreen = (props: RemoveMfaPhoneCodeProps) => {
  const { close } = useActionContext();
  return (
    <RemoveMfaPhoneCodeForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const MfaBackupCodeCreateScreen = () => {
  const { close } = useActionContext();
  return (
    <MfaBackupCodeCreateForm
      onSuccess={close}
      onReset={close}
    />
  );
};

type MfaScreenProps = {
  selectedStrategy: VerificationStrategy;
};
export const MfaScreen = (props: MfaScreenProps) => {
  const { close } = useActionContext();
  return (
    <MfaForm
      onSuccess={close}
      onReset={close}
      selectedStrategy={props.selectedStrategy}
    />
  );
};
