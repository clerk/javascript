import { withCardStateProvider } from '@/ui/elements/contexts';

import { useEnvironment } from '../../contexts';
import { SignUpEmailCodeCard } from './SignUpEmailCodeCard';
import { SignUpEmailLinkCard } from './SignUpEmailLinkCard';

export const SignUpVerifyEmail = withCardStateProvider(() => {
  const { userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const emailLinkStrategyEnabled = attributes.email_address?.verifications?.includes('email_link');

  return emailLinkStrategyEnabled ? <SignUpEmailLinkCard /> : <SignUpEmailCodeCard />;
});
