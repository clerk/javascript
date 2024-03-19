'use client';

import { SignUpRouterCtx } from '~/react/sign-up/context';

export { SignUpRoot as SignUp, SignUpRoot as Root } from './root';
export { SignUpStep as Step } from './step';
export { SignUpAction as Action } from './action';
export { SignUpStrategy as Strategy } from './verifications';
export { SignUpProvider as Provider, SignUpProviderIcon as ProviderIcon } from './providers';

export { Loading } from './loading';

/** @internal Internal use only */
export const useSignUpActorRef_internal = SignUpRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignUpSelector_internal = SignUpRouterCtx.useSelector;
