import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { SignUpEmailCodeCard } from './SignUpEmailCodeCard';
import { SignUpEmailLinkCard } from './SignUpEmailLinkCard';

export const SignUpVerifyEmail = () => {
  const { userSettings } = useEnvironment();
  const { attributes } = userSettings;

  const emailLinkStrategyEnabled = attributes.email_address.verifications.includes('email_link');
  if (emailLinkStrategyEnabled) {
    return <SignUpEmailLinkCard />;
  }

  return <SignUpEmailCodeCard />;
};
