import { describe, expect, it } from 'vitest';

import {
  buildSignInOAuthCallbackParams,
  buildSignInOAuthTransportCallbackParams,
  buildSignUpOAuthCallbackParams,
  buildSignUpOAuthTransportCallbackParams,
} from '../buildOAuthCallbackParams';

describe('buildSignInOAuthCallbackParams', () => {
  it('produces exactly the params the SignIn sso-callback route passes today', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      afterSignInUrl: '/after-in',
      afterSignUpUrl: '/after-up',
      signUpContinueUrl: '/continue',
      transferable: true,
      unsafeMetadata: { a: 1 },
    } as any;

    expect(buildSignInOAuthCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signInForceRedirectUrl: '/after-in',
      signUpForceRedirectUrl: '/after-up',
      continueSignUpUrl: '/continue',
      transferable: true,
      firstFactorUrl: '../factor-one',
      secondFactorUrl: '../factor-two',
      resetPasswordUrl: '../reset-password',
      unsafeMetadata: { a: 1 },
    });
  });

  it('does not include navigateOnSetActive', () => {
    const ctx = { navigateOnSetActive: () => Promise.resolve() } as any;
    expect('navigateOnSetActive' in buildSignInOAuthCallbackParams(ctx)).toBe(false);
  });
});

describe('buildSignInOAuthTransportCallbackParams', () => {
  it('uses paths relative to the SignIn start route for transport callbacks', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      afterSignInUrl: '/after-in',
      afterSignUpUrl: '/after-up',
      signUpContinueUrl: '/continue',
      transferable: true,
      unsafeMetadata: { a: 1 },
    } as any;

    expect(buildSignInOAuthTransportCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signInForceRedirectUrl: '/after-in',
      signUpForceRedirectUrl: '/after-up',
      continueSignUpUrl: '/continue',
      transferable: true,
      firstFactorUrl: 'factor-one',
      secondFactorUrl: 'factor-two',
      resetPasswordUrl: 'reset-password',
      unsafeMetadata: { a: 1 },
    });
  });
});

describe('buildSignUpOAuthCallbackParams', () => {
  it('produces exactly the params the combined-flow SignUp sso-callback route passes today', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      afterSignUpUrl: '/after-up',
      afterSignInUrl: '/after-in',
      secondFactorUrl: '/factor-two',
      unsafeMetadata: { b: 2 },
    } as any;

    expect(buildSignUpOAuthCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signUpForceRedirectUrl: '/after-up',
      signInForceRedirectUrl: '/after-in',
      secondFactorUrl: '/factor-two',
      continueSignUpUrl: '../continue',
      verifyEmailAddressUrl: '../verify-email-address',
      verifyPhoneNumberUrl: '../verify-phone-number',
      unsafeMetadata: { b: 2 },
    });
  });

  it('does not include navigateOnSetActive', () => {
    const ctx = { navigateOnSetActive: () => Promise.resolve() } as any;
    expect('navigateOnSetActive' in buildSignUpOAuthCallbackParams(ctx)).toBe(false);
  });
});

describe('buildSignUpOAuthTransportCallbackParams', () => {
  it('uses paths relative to the SignUp start route for transport callbacks', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      afterSignUpUrl: '/after-up',
      afterSignInUrl: '/after-in',
      secondFactorUrl: '/factor-two',
      unsafeMetadata: { b: 2 },
    } as any;

    expect(buildSignUpOAuthTransportCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signUpForceRedirectUrl: '/after-up',
      signInForceRedirectUrl: '/after-in',
      secondFactorUrl: '/factor-two',
      continueSignUpUrl: 'continue',
      verifyEmailAddressUrl: 'verify-email-address',
      verifyPhoneNumberUrl: 'verify-phone-number',
      unsafeMetadata: { b: 2 },
    });
  });
});
