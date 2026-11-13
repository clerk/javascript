import { Captcha } from '../../../components/captcha';
import { useFlowStepActive } from '../../../primitives/flow';
import { styles } from '../auth-flow.styles';

interface FlowCaptchaProps {
  onInteractiveChange?: (interactive: boolean) => void;
}

export function FlowCaptcha({ onInteractiveChange }: FlowCaptchaProps) {
  const isActive = useFlowStepActive();
  if (!isActive) {
    return null;
  }
  return (
    <Captcha
      xstyle={styles.captcha}
      onInteractiveChange={onInteractiveChange}
    />
  );
}
