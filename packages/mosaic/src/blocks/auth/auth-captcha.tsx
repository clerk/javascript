import { Captcha } from '../../components/captcha';
import { useFlowStepActive } from '../../primitives/flow/flow-step-context';
import { styles } from './auth.styles';

interface AuthCaptchaProps {
  onInteractiveChange?: (interactive: boolean) => void;
}

export function AuthCaptcha({ onInteractiveChange }: AuthCaptchaProps) {
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
