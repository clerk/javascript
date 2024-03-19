'use client';

import { SignInRouterCtx } from './context';

export { SignInRoot as SignIn, SignInRoot as Root } from './root';
export { SignInStep as Step } from './step';
export { SignInAction as Action } from './action';
export { SignInChooseStrategy as ChooseStrategy, SignInStrategyOption as StrategyOption } from './choose-strategy';
export { SignInProvider as Provider, SignInProviderIcon as ProviderIcon } from './providers';

export {
  SignInFirstFactor as FirstFactor,
  SignInSecondFactor as SecondFactor,
  SignInStrategy as Strategy,
} from './verifications';

export { Loading } from './loading';
export { SignInSafeIdentifier as SafeIdentifier, SignInSalutation as Salutation } from './identifiers';

/** @internal Internal use only */
export const useSignInActorRef_internal = SignInRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignInSelector_internal = SignInRouterCtx.useSelector;
