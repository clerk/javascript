'use client';

import { SignInRouterCtx } from './contexts/router.context';

export {
  SignInContinue as Continue,
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
} from './continue';
export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export {
  SignInSocialProvider as SocialProvider,
  SignInSocialProviderIcon as SocialProviderIcon,
} from './social-providers';
export { SignInStart as Start } from './start';
export { SignInVerification as Verification } from './verifications';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInRouterCtx.useSelector;
