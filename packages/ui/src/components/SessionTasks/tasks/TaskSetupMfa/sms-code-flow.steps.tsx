import { withCardStateProvider } from '@/elements/contexts';

import { useSmsAddPhoneController } from './sms-add-phone.controller';
import { SmsAddPhoneView } from './sms-add-phone.view';
import { useSmsCodeFlowModelContext } from './sms-code-flow.model';
import type { SmsVerificationModel } from './sms-code-flow.types';
import { useSmsPhoneSelectionController } from './sms-phone-selection.controller';
import { SmsPhoneSelectionView } from './sms-phone-selection.view';
import { SmsSuccessView } from './sms-success.view';
import { useSmsVerifyPhoneController } from './sms-verify-phone.controller';
import { SmsVerifyPhoneView } from './sms-verify-phone.view';

type StepProps = { onSuccess: () => void; onReset: () => void };

export const SmsAddPhoneStep = withCardStateProvider(({ onSuccess, onReset }: StepProps) => {
  const model = useSmsCodeFlowModelContext();
  const controller = useSmsAddPhoneController(model, onSuccess, onReset);
  return <SmsAddPhoneView controller={controller} />;
});

const SmsVerifyPhoneContent = withCardStateProvider(
  ({ model, onSuccess, onReset }: StepProps & { model: SmsVerificationModel }) => {
    const controller = useSmsVerifyPhoneController(model, onSuccess, onReset);
    return <SmsVerifyPhoneView controller={controller} />;
  },
);

export const SmsVerifyPhoneStep = (props: StepProps) => {
  const model = useSmsCodeFlowModelContext();
  return (
    <SmsVerifyPhoneContent
      key={model.verification.scopeKey}
      model={model.verification}
      {...props}
    />
  );
};

type SelectPhoneProps = StepProps & { onAddPhoneClick: () => void; onUnverifiedPhoneClick: () => void };

export const SmsSelectPhoneStep = withCardStateProvider((props: SelectPhoneProps) => {
  const model = useSmsCodeFlowModelContext();
  const controller = useSmsPhoneSelectionController(
    model,
    props.onSuccess,
    props.onReset,
    props.onAddPhoneClick,
    props.onUnverifiedPhoneClick,
  );
  return <SmsPhoneSelectionView controller={controller} />;
});

export const SmsSuccessStep = withCardStateProvider(({ onFinish }: { onFinish: () => void }) => {
  const model = useSmsCodeFlowModelContext();
  return (
    <SmsSuccessView
      backupCodes={model.backupCodes}
      onFinish={onFinish}
    />
  );
});
