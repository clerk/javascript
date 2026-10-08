import type { SignUpCtx } from '@/ui/types';

export type SignUpRoutesData = Pick<SignUpCtx, 'oidcPrompt' | 'unsafeMetadata'> & {
  signUpUrl: string;
  signInUrl: string;
  afterSignUpUrl: string;
  afterSignInUrl: string;
  secondFactorUrl: string;
  ssoCallbackUrl: string;
  canVerifyEmail: () => boolean;
  canVerifyPhone: () => boolean;
};
