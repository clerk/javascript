'use client';

import { SignInRouterCtx } from './context';

export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export { SignInStep as Step } from './step';
export { SignInGoBack as GoBack } from './go-back';

export {
  SignInChooseStrategy as ChooseStrategy,
  SignInChooseAlternateStrategy as ChooseAlternateStrategy,
  SignInAvailableStrategy as AvailableStrategy,
} from './choose-strategy';

export {
  SignInSocialProvider as SocialProvider,
  SignInSocialProviderIcon as SocialProviderIcon,
} from './social-providers';

export {
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
  SignInVerification as Verification,
} from './verifications';

export { useIsLoading_unstable } from './hooks/use-loading.hook';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInRouterCtx.useSelector;
