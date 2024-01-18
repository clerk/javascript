'use client';

import { useNextRouter } from '~/react/router/next';

/** Common Components */
export { Field, FieldError, FieldState, Form, GlobalError, Input, Label, Submit } from '~/react/common/form';
export { SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';

/** Sign In Components */
export {
  SignIn,
  SignInStart,
  SignInFactorOne,
  SignInFactorTwo,
  SignInContinue,
  SignInSocialProviders,
  SignInSocialProvider,
  SignInSocialProviderIcon,
  SignInStrategy,
} from '~/react/sign-in';

/** Sign Up Components */
export {
  SignUp,
  SignUpStart,
  SignUpContinue,
  SignUpVerify,
  SignUpSocialProviders,
  SignUpSocialProvider,
  SignUpSocialProviderIcon,
  SignUpStrategy,
} from '~/react/sign-up';

/** Hooks */
export { useSignUpFlow, useSignUpFlowSelector } from '~/internals/machines/sign-up/sign-up.context';
export { useSignInFlow, useSignInFlowSelector } from '~/internals/machines/sign-in/sign-in.context';
export { useNextRouter };
