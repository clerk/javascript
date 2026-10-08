import { withCardStateProvider } from '@/ui/elements/contexts';

import type { TotpVerificationModel, TotpVerificationOptions } from './mfa-totp.types';
import { useVerifyTOTPController } from './verify-totp.controller';
import type { VerifyTOTPProps } from './verify-totp.model';
import { useVerifyTOTPModel } from './verify-totp.model';
import { VerifyTOTPView } from './verify-totp.view';

export const VerifyTOTP = (props: VerifyTOTPProps | (TotpVerificationOptions & { model: TotpVerificationModel })) => {
  if ('model' in props) {
    return (
      <VerifyTOTPContent
        key={props.model.requestKey}
        {...props}
      />
    );
  }
  return <LegacyVerifyTOTP {...props} />;
};

const LegacyVerifyTOTP = (props: VerifyTOTPProps) => {
  const model = useVerifyTOTPModel(props);
  return (
    <VerifyTOTPContent
      key={model.requestKey}
      model={model}
      onSuccess={props.onSuccess}
      onReset={props.onReset}
      onBack={props.onBack}
    />
  );
};

const VerifyTOTPContent = withCardStateProvider(
  ({ model, ...props }: TotpVerificationOptions & { model: TotpVerificationModel }) => {
    const controller = useVerifyTOTPController(model, props);

    return <VerifyTOTPView controller={controller} />;
  },
);
