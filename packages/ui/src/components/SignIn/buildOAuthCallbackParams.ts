import { buildURL, trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import type { HandleOAuthCallbackParams } from '@clerk/shared/types';

import type { SignInContextType } from '../../contexts/components/SignIn';
import type { SignUpContextType } from '../../contexts/components/SignUp';

export const signUpStepUrls = (prefix: string) => ({
  continueSignUpUrl: `${prefix}continue`,
  verifyEmailAddressUrl: `${prefix}verify-email-address`,
  verifyPhoneNumberUrl: `${prefix}verify-phone-number`,
  signUpProtectCheckUrl: `${prefix}protect-check`,
  enterpriseConnectionsUrl: `${prefix}enterprise-connections`,
});

export function buildSignInOAuthCallbackParams(ctx: SignInContextType): HandleOAuthCallbackParams {
  return {
    signUpUrl: ctx.signUpUrl,
    signInUrl: ctx.signInUrl,
    signInForceRedirectUrl: ctx.afterSignInUrl,
    signUpForceRedirectUrl: ctx.afterSignUpUrl,
    transferable: ctx.transferable,
    firstFactorUrl: '../factor-one',
    secondFactorUrl: '../factor-two',
    resetPasswordUrl: '../reset-password',
    signInProtectCheckUrl: '../protect-check',
    ...(ctx.isCombinedFlow
      ? signUpStepUrls('../create/')
      : {
          continueSignUpUrl: ctx.signUpContinueUrl,
          signUpProtectCheckUrl: ctx.signUpProtectCheckUrl,
          enterpriseConnectionsUrl: ctx.signUpEnterpriseConnectionsUrl,
        }),
    unsafeMetadata: ctx.unsafeMetadata,
  };
}

export function buildSignInOAuthTransportCallbackParams(ctx: SignInContextType): HandleOAuthCallbackParams {
  // Path form, not `#/step`: the in-place component router matches on pathname only and would drop the hash.
  const signUpStepUrl = (step: string): string => {
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
    ...(ctx.isCombinedFlow
      ? signUpStepUrls('create/')
      : {
          continueSignUpUrl: signUpStepUrl('continue'),
          verifyEmailAddressUrl: signUpStepUrl('verify-email-address'),
          verifyPhoneNumberUrl: signUpStepUrl('verify-phone-number'),
          signUpProtectCheckUrl: signUpStepUrl('protect-check'),
          enterpriseConnectionsUrl: signUpStepUrl('enterprise-connections'),
        }),
  };
}

export function buildSignUpOAuthCallbackParams(ctx: SignUpContextType): HandleOAuthCallbackParams {
  return {
    signUpUrl: ctx.signUpUrl,
    signInUrl: ctx.signInUrl,
    signUpForceRedirectUrl: ctx.afterSignUpUrl,
    signInForceRedirectUrl: ctx.afterSignInUrl,
    secondFactorUrl: ctx.secondFactorUrl,
    ...signUpStepUrls('../'),
    unsafeMetadata: ctx.unsafeMetadata,
  };
}

export function buildCombinedFlowOAuthCallbackParams(ctx: SignUpContextType): HandleOAuthCallbackParams {
  return {
    ...buildSignUpOAuthCallbackParams(ctx),
    firstFactorUrl: '../../factor-one',
    secondFactorUrl: '../../factor-two',
    resetPasswordUrl: '../../reset-password',
    signInProtectCheckUrl: '../../protect-check',
  };
}

export function buildSignUpOAuthTransportCallbackParams(ctx: SignUpContextType): HandleOAuthCallbackParams {
  return {
    ...buildSignUpOAuthCallbackParams(ctx),
    ...signUpStepUrls(''),
  };
}
