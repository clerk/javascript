import React from 'react';

import { EmailLinkVerify, EmailLinkVerifyProps } from '../common';
import { withCardStateProvider } from '../elements';

const signInTexts = {
  verified: {
    title: 'Successfully signed in',
    subtitle: 'You will be redirected soon',
  },
  verified_switch_tab: {
    title: 'Successfully signed in',
    subtitle: 'Return to original tab to continue',
  },
  loading: {
    title: 'Signing in...',
    subtitle: 'You will be redirected soon',
  },
  failed: {
    title: 'This verification link is invalid',
    subtitle: 'Return to the original tab to continue.',
  },
  expired: {
    title: 'This verification link has expired',
    subtitle: 'Return to the original tab to continue.',
  },
};

const signUpTexts = {
  ...signInTexts,
  verified: {
    ...signInTexts.verified,
    title: 'Successfully signed up',
  },
  verified_switch_tab: {
    ...signInTexts.verified_switch_tab,
    title: 'Successfully signed up',
  },
  loading: {
    ...signInTexts.loading,
    title: 'Signing up...',
  },
};

export const SignInEmailLinkFlowComplete = withCardStateProvider((props: Omit<EmailLinkVerifyProps, 'texts'>) => {
  return (
    <EmailLinkVerify
      {...props}
      texts={signInTexts}
    />
  );
});

export const SignUpEmailLinkFlowComplete = withCardStateProvider((props: Omit<EmailLinkVerifyProps, 'texts'>) => {
  return (
    <EmailLinkVerify
      {...props}
      texts={signUpTexts}
    />
  );
});
