import { Captcha } from '../../../components/captcha';
import { useFlowStepActive } from '../../../primitives/flow';
import { styles } from '../sign-in.styles';

interface SignInCaptchaProps {
  onInteractiveChange?: (interactive: boolean) => void;
}

export function SignInCaptcha({ onInteractiveChange }: SignInCaptchaProps) {
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
