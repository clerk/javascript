import { useEnvironment } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { SignUpEmailCodeCard } from './SignUpEmailCodeCard';
import { SignUpEmailLinkCard } from './SignUpEmailLinkCard';

export const SignUpVerifyEmail = withCardStateProvider(() => {
  const { userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const emailLinkStrategyEnabled = attributes.email_address.verifications.includes('email_link');

  if (emailLinkStrategyEnabled) {
    return <SignUpEmailLinkCard />;
  }

  return <SignUpEmailCodeCard />;
});
