import { useWizard, Wizard } from '@/ui/common';
import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { localizationKeys } from '@/ui/localization';

import { AddAuthenticatorApp } from './AddAuthenticatorApp';
import { useMfaTotpModel } from './mfa-totp.model';
import type { MfaTotpData } from './mfa-totp.types';
import { MfaBackupCodeList } from './MfaBackupCodeList';
import { VerifyTOTP } from './VerifyTOTP';

export const MfaTOTPScreen = (props: FormProps) => {
  const model = useMfaTotpModel();
  return (
    <MfaTotpContent
      key={model.requestKey}
      model={model}
      {...props}
    />
  );
};

const MfaTotpContent = withCardStateProvider(({ model, ...props }: FormProps & { model: MfaTotpData }) => {
  const wizard = useWizard();
  const onReset = () => {
    if (model.canRun()) {
      props.onReset();
    }
  };
  const nextStep = () => {
    if (model.canRun()) {
      wizard.nextStep();
    }
  };
  const prevStep = () => {
    if (model.canRun()) {
      wizard.prevStep();
    }
  };
  return (
    <Wizard {...wizard.props}>
      <AddAuthenticatorApp
        model={model}
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        onSuccess={nextStep}
        onReset={onReset}
      />
      <VerifyTOTP
        model={model}
        onSuccess={nextStep}
        onReset={onReset}
        onBack={prevStep}
      />
      <SuccessPage
        title={localizationKeys('userProfile.mfaTOTPPage.title')}
        text={localizationKeys('userProfile.mfaTOTPPage.successMessage')}
        onFinish={onReset}
        contents={
          <MfaBackupCodeList
            subtitle={localizationKeys('userProfile.backupCodePage.successSubtitle')}
            backupCodes={model.backupCodes}
          />
        }
      />
    </Wizard>
  );
});
