'use client';

import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';

export { SignInContinue as Continue } from './continue';
export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export {
  SignInSocialProvider as SocialProvider,
  SignInSocialProviderIcon as SocialProviderIcon,
} from './social-providers';
export { SignInStart as Start } from './start';
export { SignInFactor as Factor, SignInVerification as Verification } from './verifications';

export { unstable_useIsLoading } from './hooks/use-loading.hook';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInCtx.useSelector;
