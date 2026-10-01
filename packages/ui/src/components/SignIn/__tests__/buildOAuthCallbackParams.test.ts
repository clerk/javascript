import { describe, expect, it } from 'vitest';

import {
  buildSignInOAuthCallbackParams,
  buildSignInOAuthTransportCallbackParams,
  buildSignUpOAuthCallbackParams,
  buildSignUpOAuthTransportCallbackParams,
} from '../buildOAuthCallbackParams';

describe('buildSignInOAuthCallbackParams', () => {
  it('returns params for the SignIn sso-callback route', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      afterSignInUrl: '/after-in',
      afterSignUpUrl: '/after-up',
      signUpContinueUrl: '/continue',
      signUpProtectCheckUrl: '/sign-up-protect-check',
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
      signInProtectCheckUrl: '../protect-check',
      signUpProtectCheckUrl: '/sign-up-protect-check',
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
      signUpProtectCheckUrl: '/sign-up-protect-check',
      transferable: true,
      unsafeMetadata: { a: 1 },
    } as any;

    const origin = window.location.origin;

    expect(buildSignInOAuthTransportCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signInForceRedirectUrl: '/after-in',
      signUpForceRedirectUrl: '/after-up',
      transferable: true,
      firstFactorUrl: 'factor-one',
      secondFactorUrl: 'factor-two',
      resetPasswordUrl: 'reset-password',
      signInProtectCheckUrl: 'protect-check',
      // Sign-up steps are path routes on the sign-up component; hash-style URLs would lose their
      // hash in the virtual router and land a transferred sign-up on the start card.
      continueSignUpUrl: `${origin}/sign-up/continue`,
      verifyEmailAddressUrl: `${origin}/sign-up/verify-email-address`,
      verifyPhoneNumberUrl: `${origin}/sign-up/verify-phone-number`,
      signUpProtectCheckUrl: `${origin}/sign-up/protect-check`,
      unsafeMetadata: { a: 1 },
    });
  });

  it('targets the virtual sign-up routes for modal transport callbacks', () => {
    const ctx = {
      signUpUrl: '/CLERK-ROUTER/VIRTUAL/sign-up',
      signInUrl: '/CLERK-ROUTER/VIRTUAL/sign-in',
    } as any;

    const params = buildSignInOAuthTransportCallbackParams(ctx);
    const origin = window.location.origin;

    expect(params.continueSignUpUrl).toBe(`${origin}/CLERK-ROUTER/VIRTUAL/sign-up/continue`);
    expect(params.verifyEmailAddressUrl).toBe(`${origin}/CLERK-ROUTER/VIRTUAL/sign-up/verify-email-address`);
    expect(params.verifyPhoneNumberUrl).toBe(`${origin}/CLERK-ROUTER/VIRTUAL/sign-up/verify-phone-number`);
    expect(params.signUpProtectCheckUrl).toBe(`${origin}/CLERK-ROUTER/VIRTUAL/sign-up/protect-check`);
  });

  it('drops a hash fragment from signUpUrl when building sign-up step URLs', () => {
    const ctx = {
      signUpUrl: '/sign-up#/continue',
      signInUrl: '/sign-in',
    } as any;

    const params = buildSignInOAuthTransportCallbackParams(ctx);
    const origin = window.location.origin;

    expect(params.continueSignUpUrl).toBe(`${origin}/sign-up/continue`);
    expect(params.verifyEmailAddressUrl).toBe(`${origin}/sign-up/verify-email-address`);
    expect(params.verifyPhoneNumberUrl).toBe(`${origin}/sign-up/verify-phone-number`);
    expect(params.signUpProtectCheckUrl).toBe(`${origin}/sign-up/protect-check`);
  });

  it('targets the embedded create subtree in the combined flow', () => {
    const ctx = {
      signUpUrl: '/sign-in#/create',
      signInUrl: '/sign-in',
      isCombinedFlow: true,
    } as any;

    const params = buildSignInOAuthTransportCallbackParams(ctx);

    expect(params.continueSignUpUrl).toBe('create/continue');
    expect(params.verifyEmailAddressUrl).toBe('create/verify-email-address');
    expect(params.verifyPhoneNumberUrl).toBe('create/verify-phone-number');
    expect(params.signUpProtectCheckUrl).toBe('create/protect-check');
  });
});

describe('buildSignUpOAuthCallbackParams', () => {
  it('returns params for the combined-flow SignUp sso-callback route', () => {
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
      signUpProtectCheckUrl: '../protect-check',
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
      signUpProtectCheckUrl: 'protect-check',
      unsafeMetadata: { b: 2 },
    });
  });
});
