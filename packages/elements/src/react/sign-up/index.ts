'use client';

import { SignUpRouterCtx } from '~/react/sign-up/context';

export { SignUpRoot as SignUp, SignUpRoot as Root } from './root';
export { SignUpStep as Step } from './step';
export { SignUpGoBack as GoBack } from './go-back';
export { SignUpVerification as Verification } from './verifications';

export {
  SignUpSocialProvider as SocialProvider,
  SignUpSocialProviderIcon as SocialProviderIcon,
} from './social-providers';

/** @internal Internal use only */
export const useSignUpActorRef_internal = SignUpRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignUpSelector_internal = SignUpRouterCtx.useSelector;
