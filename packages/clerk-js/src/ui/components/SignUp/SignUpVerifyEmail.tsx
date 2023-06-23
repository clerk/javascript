import { useEffect } from 'react';

import { useCoreSignUp, useEnvironment } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { SignUpEmailCodeCard } from './SignUpEmailCodeCard';
import { SignUpEmailLinkCard } from './SignUpEmailLinkCard';

export const SignUpVerifyEmail = withCardStateProvider(() => {
  const { userSettings } = useEnvironment();
  const signUp = useCoreSignUp();
  const router = useRouter();
  const { attributes } = userSettings;

  //TODO: remove this once a global solution for route validation is ready
  useEffect(() => {
    if (!signUp.emailAddress) {
      void router.navigate('../');
    }
  }, []);

  const emailLinkStrategyEnabled = attributes.email_address.verifications.includes('email_link');
  if (emailLinkStrategyEnabled) {
    return <SignUpEmailLinkCard />;
  }

  return <SignUpEmailCodeCard />;
});
