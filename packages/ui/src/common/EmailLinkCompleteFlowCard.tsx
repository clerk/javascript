import { withCardStateProvider } from '../elements/contexts';
import { localizationKeys } from '../localization';
import type { EmailLinkVerifyProps } from './EmailLinkVerify';
import { EmailLinkVerify } from './EmailLinkVerify';

const signInLocalizationKeys = {
  verified: {
    title: localizationKeys('signIn.emailLink.verified.title'),
    subtitle: localizationKeys('signIn.emailLink.verified.subtitle'),
  },
  verified_switch_tab: {
    title: localizationKeys('signIn.emailLink.verified.title'),
    subtitle: localizationKeys('signIn.emailLink.verifiedSwitchTab.subtitle'),
  },
  loading: {
    title: localizationKeys('signIn.emailLink.loading.title'),
    subtitle: localizationKeys('signIn.emailLink.loading.subtitle'),
  },
  failed: {
    title: localizationKeys('signIn.emailLink.failed.title'),
    subtitle: localizationKeys('signIn.emailLink.failed.subtitle'),
  },
  expired: {
    title: localizationKeys('signIn.emailLink.expired.title'),
    subtitle: localizationKeys('signIn.emailLink.expired.subtitle'),
  },
  client_mismatch: {
    title: localizationKeys('signIn.emailLink.clientMismatch.title'),
    subtitle: localizationKeys('signIn.emailLink.clientMismatch.subtitle'),
  },
};

const signUpLocalizationKeys = {
  ...signInLocalizationKeys,
  verified: {
    ...signInLocalizationKeys.verified,
    title: localizationKeys('signUp.emailLink.verified.title'),
  },
  verified_switch_tab: {
    ...signInLocalizationKeys.verified_switch_tab,
    title: localizationKeys('signUp.emailLink.verified.title'),
  },
  loading: {
    ...signInLocalizationKeys.loading,
    title: localizationKeys('signUp.emailLink.loading.title'),
  },
  client_mismatch: {
    ...signInLocalizationKeys.client_mismatch,
    subtitle: localizationKeys('signUp.emailLink.clientMismatch.subtitle'),
  },
};

export const SignInEmailLinkFlowComplete = withCardStateProvider((props: Omit<EmailLinkVerifyProps, 'texts'>) => {
  return (
    <EmailLinkVerify
      {...props}
      texts={signInLocalizationKeys}
    />
  );
});

export const SignUpEmailLinkFlowComplete = withCardStateProvider((props: Omit<EmailLinkVerifyProps, 'texts'>) => {
  return (
    <EmailLinkVerify
      {...props}
      texts={signUpLocalizationKeys}
    />
  );
});
