import { describe, expect, it } from 'vitest';

import {
  buildCombinedFlowOAuthCallbackParams,
  buildSignInOAuthCallbackParams,
  buildSignInOAuthTransportCallbackParams,
  buildSignInProtectCheckResumeParams,
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

describe('buildSignInProtectCheckResumeParams', () => {
  it('keeps the sign-in callback params outside the combined flow', () => {
    const ctx = {
      signUpUrl: '/sign-up',
      signInUrl: '/sign-in',
      signUpContinueUrl: '/sign-up#/continue',
      signUpProtectCheckUrl: '/sign-up#/protect-check',
      isCombinedFlow: false,
    } as any;

    expect(buildSignInProtectCheckResumeParams(ctx)).toEqual(buildSignInOAuthCallbackParams(ctx));
  });

  it('routes a combined-flow transfer to the embedded create routes', () => {
    const ctx = {
      signUpUrl: '/sign-in#/create',
      signInUrl: '/sign-in',
      signUpContinueUrl: '/sign-in#/create/continue',
      signUpProtectCheckUrl: '/sign-in#/create/protect-check',
      isCombinedFlow: true,
    } as any;

    expect(buildSignInProtectCheckResumeParams(ctx)).toEqual({
      ...buildSignInOAuthCallbackParams(ctx),
      continueSignUpUrl: '../create/continue',
      verifyEmailAddressUrl: '../create/verify-email-address',
      verifyPhoneNumberUrl: '../create/verify-phone-number',
      signUpProtectCheckUrl: '../create/protect-check',
    });
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

describe('buildCombinedFlowOAuthCallbackParams', () => {
  it('routes sign-in steps from the combined-flow create/sso-callback route back to the SignIn routes', () => {
    const ctx = {
      signUpUrl: '/sign-in#/create',
      signInUrl: '/sign-in',
      afterSignUpUrl: '/after-up',
      afterSignInUrl: '/after-in',
      secondFactorUrl: '/sign-in#/factor-two',
      unsafeMetadata: { b: 2 },
    } as any;

    expect(buildCombinedFlowOAuthCallbackParams(ctx)).toEqual({
      signUpUrl: '/sign-in#/create',
      signInUrl: '/sign-in',
      signUpForceRedirectUrl: '/after-up',
      signInForceRedirectUrl: '/after-in',
      firstFactorUrl: '../../factor-one',
      secondFactorUrl: '../../factor-two',
      resetPasswordUrl: '../../reset-password',
      signInProtectCheckUrl: '../../protect-check',
      continueSignUpUrl: '../continue',
      verifyEmailAddressUrl: '../verify-email-address',
      verifyPhoneNumberUrl: '../verify-phone-number',
      signUpProtectCheckUrl: '../protect-check',
      unsafeMetadata: { b: 2 },
    });
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
