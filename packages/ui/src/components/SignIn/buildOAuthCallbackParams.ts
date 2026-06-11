import type { HandleOAuthCallbackParams } from '@clerk/shared/types';

import type { SignInContextType } from '../../contexts/components/SignIn';
import type { SignUpContextType } from '../../contexts/components/SignUp';

/**
 * Exact callback params the SignIn `sso-callback` route passes to SSOCallback.
 * Excludes `navigateOnSetActive`, which is transport-only.
 */
export function buildSignInOAuthCallbackParams(ctx: SignInContextType): HandleOAuthCallbackParams {
  return {
    signUpUrl: ctx.signUpUrl,
    signInUrl: ctx.signInUrl,
    signInForceRedirectUrl: ctx.afterSignInUrl,
    signUpForceRedirectUrl: ctx.afterSignUpUrl,
    continueSignUpUrl: ctx.signUpContinueUrl,
    transferable: ctx.transferable,
    firstFactorUrl: '../factor-one',
    secondFactorUrl: '../factor-two',
    resetPasswordUrl: '../reset-password',
    unsafeMetadata: ctx.unsafeMetadata,
  };
}

/**
 * Exact callback params the combined-flow SignUp `sso-callback` route passes to SSOCallback.
 */
export function buildSignUpOAuthCallbackParams(ctx: SignUpContextType): HandleOAuthCallbackParams {
  return {
    signUpUrl: ctx.signUpUrl,
    signInUrl: ctx.signInUrl,
    signUpForceRedirectUrl: ctx.afterSignUpUrl,
    signInForceRedirectUrl: ctx.afterSignInUrl,
    secondFactorUrl: ctx.secondFactorUrl,
    continueSignUpUrl: '../continue',
    verifyEmailAddressUrl: '../verify-email-address',
    verifyPhoneNumberUrl: '../verify-phone-number',
    unsafeMetadata: ctx.unsafeMetadata,
  };
}
