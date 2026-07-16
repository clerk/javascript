import type { HandleOAuthCallbackParams } from '@clerk/shared/types';

import type { SignInContextType } from '../../contexts/components/SignIn';
import type { SignUpContextType } from '../../contexts/components/SignUp';

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
    signInProtectCheckUrl: '../protect-check',
    // Absolute + combined-flow-aware (see SignIn context), so it stays correct regardless of the
    // callback route's depth.
    signUpProtectCheckUrl: ctx.signUpProtectCheckUrl,
    unsafeMetadata: ctx.unsafeMetadata,
  };
}

export function buildSignInOAuthTransportCallbackParams(ctx: SignInContextType): HandleOAuthCallbackParams {
  return {
    ...buildSignInOAuthCallbackParams(ctx),
    firstFactorUrl: 'factor-one',
    secondFactorUrl: 'factor-two',
    resetPasswordUrl: 'reset-password',
    signInProtectCheckUrl: 'protect-check',
  };
}

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
    signUpProtectCheckUrl: '../protect-check',
    unsafeMetadata: ctx.unsafeMetadata,
  };
}

export function buildSignUpOAuthTransportCallbackParams(ctx: SignUpContextType): HandleOAuthCallbackParams {
  return {
    ...buildSignUpOAuthCallbackParams(ctx),
    continueSignUpUrl: 'continue',
    verifyEmailAddressUrl: 'verify-email-address',
    verifyPhoneNumberUrl: 'verify-phone-number',
    signUpProtectCheckUrl: 'protect-check',
  };
}
