import { useSignUpVerifyController } from '../sign-up.controller';
import type { SignUpVerifyScreen } from '../sign-up.types';
import { SignUpCodeStep } from './sign-up-code';

interface SignUpVerifyProps extends SignUpVerifyScreen {
  channel: 'email' | 'phone';
}

export function SignUpVerify({
  channel,
  identifier,
  provider,
  onEditIdentifier,
  onCancel,
  ...options
}: SignUpVerifyProps) {
  const controller = useSignUpVerifyController(options);

  return (
    <SignUpCodeStep
      {...controller}
      step={{ purpose: channel === 'email' ? 'verify-email' : 'verify-phone', identifier, provider }}
      onEditIdentifier={onEditIdentifier}
      onCancel={onCancel}
    />
  );
}
