import { useSmsCodeFlowController } from './sms-code-flow.controller';
import { SmsCodeFlowModelContext, useSmsCodeFlowModel, useSmsCodeFlowModelContext } from './sms-code-flow.model';
import { SmsCodeFlowView } from './sms-code-flow.view';

type SmsCodeFlowProps = {
  onSuccess: () => void;
  goToStartStep: () => void;
};

const SmsCodeFlowContent = ({ onSuccess, goToStartStep }: SmsCodeFlowProps) => {
  const model = useSmsCodeFlowModelContext();
  const controller = useSmsCodeFlowController(model, onSuccess, goToStartStep);
  return <SmsCodeFlowView controller={controller} />;
};

export const SmsCodeFlow = (props: SmsCodeFlowProps) => {
  const model = useSmsCodeFlowModel();
  return (
    <SmsCodeFlowModelContext.Provider value={{ value: model }}>
      <SmsCodeFlowContent
        key={model.scopeKey}
        {...props}
      />
    </SmsCodeFlowModelContext.Provider>
  );
};
