import { buildURL, trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
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
  // Path form, not `#/step`: the in-place component router matches on pathname only and would drop the hash.
  const signUpStepUrl = (step: string): string => {
    if (ctx.isCombinedFlow) {
      return `create/${step}`;
    }
    const url = buildURL({ base: ctx.signUpUrl }, { stringify: false });
    url.pathname = `${trimTrailingSlash(url.pathname)}/${step}`;
    url.hash = '';
    return url.href;
  };

  return {
    ...buildSignInOAuthCallbackParams(ctx),
    firstFactorUrl: 'factor-one',
    secondFactorUrl: 'factor-two',
    resetPasswordUrl: 'reset-password',
    signInProtectCheckUrl: 'protect-check',
    continueSignUpUrl: signUpStepUrl('continue'),
    verifyEmailAddressUrl: signUpStepUrl('verify-email-address'),
    verifyPhoneNumberUrl: signUpStepUrl('verify-phone-number'),
    signUpProtectCheckUrl: signUpStepUrl('protect-check'),
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
