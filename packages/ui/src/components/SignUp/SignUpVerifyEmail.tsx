import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpVerifyEmailModel } from './sign-up-verify-email.model';
import { SignUpVerifyEmailView } from './sign-up-verify-email.view';

export const SignUpVerifyEmail = withCardStateProvider(() => {
  const model = useSignUpVerifyEmailModel();
  return <SignUpVerifyEmailView emailLinkStrategyEnabled={model.emailLinkStrategyEnabled} />;
});
