// Mark as a client-only package. This will error if you try to import it in a React Server Component.
import 'client-only';

import { SignUpRouterCtx } from '~/react/sign-up/context';

export { SignUpRoot as SignUp, SignUpRoot as Root } from './root';
export { SignUpStep as Step } from './step';
export { SignUpAction as Action } from './action';
export { SignUpStrategy as Strategy } from './verifications';
export { SignUpCaptcha as Captcha } from './captcha';

/** @internal Internal use only */
export const useSignUpActorRef_internal = SignUpRouterCtx.useActorRef;

/** @internal Internal use only */
export const useSignUpSelector_internal = SignUpRouterCtx.useSelector;
