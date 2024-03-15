'use client';

import { SignInRouterCtx } from './context';

export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export { SignInStep as Step } from './step';
export { SignInNavigate as Navigate } from './navigation';
export { SignInChooseStrategy as ChooseStrategy, SignInStrategyOption as StrategyOption } from './choose-strategy';
export { SignInProvider as Provider, SignInProviderIcon as ProviderIcon } from './providers';

export {
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
  SignInVerification as Verification,
} from './verifications';

export { SignInSafeIdentifier as SafeIdentifier, SignInSalutation as Salutation } from './identifiers';

export { useIsLoading_unstable } from './hooks/use-loading.hook';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInRouterCtx.useSelector;
