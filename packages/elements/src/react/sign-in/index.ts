'use client';

import { SignInRouterCtx } from './context';

export { SignInRoot as SignIn, SignInRoot as Root } from './root';

export {
  SignInSocialProvider as SocialProvider,
  SignInSocialProviderIcon as SocialProviderIcon,
} from './social-providers';

export { SignInStart as Start } from './start';

export {
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
  SignInVerification as Verification,
  SignInVerify as Verify,
} from './verifications';

export { unstable_useIsLoading } from '../hooks/use-loading.hook';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInRouterCtx.useSelector;
