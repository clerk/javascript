'use client';

import { SignUpRouterCtx } from '~/react/sign-up/context';

export { SignUpContinue as Continue } from './continue';
export { SignUpRoot as SignUp, SignUpRoot as Root } from './root';
export {
  SignUpSocialProvider as SocialProvider,
  SignUpSocialProviderIcon as SocialProviderIcon,
} from './social-providers';
export { SignUpStart as Start } from './start';
export { SignUpVerification as Verification, SignUpVerify as Verify } from './verifications';

/** @internal Internal use only */
export const useSignUpActorRef_internal = SignUpRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignUpSelector_internal = SignUpRouterCtx.useSelector;
