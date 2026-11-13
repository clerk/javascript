import { describe, expect, it } from 'vitest';

import type { SignInNextStepInput, SignUpNextStepInput } from '../nextStep';
import { getSignInNextStep, getSignUpNextStep } from '../nextStep';

const notStarted = { status: null, strategy: null };
const protectCheck = { status: 'pending' as const, token: 'token', sdkUrl: 'https://protect.example/sdk.js' };

function signIn(overrides: Partial<SignInNextStepInput>): SignInNextStepInput {
  return {
    status: 'needs_identifier',
    protectCheck: null,
    isTransferable: false,
    firstFactorVerification: notStarted,
    secondFactorVerification: notStarted,
    createdSessionId: null,
    ...overrides,
  };
}

function signUp(overrides: Partial<SignUpNextStepInput>): SignUpNextStepInput {
  return {
    id: 'sua_1',
    status: 'missing_requirements',
    protectCheck: null,
    isTransferable: false,
    missingFields: [],
    unverifiedFields: [],
    emailAddress: null,
    phoneNumber: null,
    verifications: { emailAddress: { nextAction: '' }, phoneNumber: { nextAction: '' } },
    createdSessionId: null,
    ...overrides,
  };
}

describe('getSignInNextStep', () => {
  it.each([
    [null, { type: 'identifier' }],
    ['needs_identifier', { type: 'identifier' }],
    ['needs_first_factor', { type: 'first_factor', strategy: null, sent: false }],
    ['needs_second_factor', { type: 'second_factor', strategy: null, sent: false }],
    ['needs_client_trust', { type: 'client_trust' }],
    ['needs_new_password', { type: 'new_password' }],
    ['needs_protect_check', { type: 'protect' }],
  ])('maps status %s', (status, expected) => {
    expect(getSignInNextStep(signIn({ status }))).toEqual(expected);
  });

  it('returns complete with the created session', () => {
    expect(getSignInNextStep(signIn({ status: 'complete', createdSessionId: 'sess_1' }))).toEqual({
      type: 'complete',
      createdSessionId: 'sess_1',
    });
  });

  it('marks a prepared first factor as sent', () => {
    const step = getSignInNextStep(
      signIn({
        status: 'needs_first_factor',
        firstFactorVerification: { status: 'unverified', strategy: 'email_code' },
      }),
    );
    expect(step).toEqual({ type: 'first_factor', strategy: 'email_code', sent: true });
  });

  it('marks an expired first factor as not sent, so the client sends a new code', () => {
    const step = getSignInNextStep(
      signIn({ status: 'needs_first_factor', firstFactorVerification: { status: 'expired', strategy: 'email_code' } }),
    );
    expect(step).toEqual({ type: 'first_factor', strategy: 'email_code', sent: false });
  });

  it('marks a prepared second factor as sent', () => {
    const step = getSignInNextStep(
      signIn({
        status: 'needs_second_factor',
        secondFactorVerification: { status: 'unverified', strategy: 'phone_code' },
      }),
    );
    expect(step).toEqual({ type: 'second_factor', strategy: 'phone_code', sent: true });
  });

  it('treats a web3 signature as a first factor', () => {
    const step = getSignInNextStep(
      signIn({
        status: 'needs_first_factor',
        firstFactorVerification: { status: 'unverified', strategy: 'web3_metamask_signature' },
      }),
    );
    expect(step).toEqual({ type: 'first_factor', strategy: 'web3_metamask_signature', sent: true });
  });

  it('puts a protect check before any status', () => {
    expect(getSignInNextStep(signIn({ status: 'needs_second_factor', protectCheck }))).toEqual({ type: 'protect' });
  });

  it('returns transfer for a transferable sign-in', () => {
    expect(getSignInNextStep(signIn({ status: 'needs_identifier', isTransferable: true }))).toEqual({
      type: 'transfer',
    });
  });

  it('puts a protect check before a transfer', () => {
    expect(getSignInNextStep(signIn({ isTransferable: true, protectCheck }))).toEqual({ type: 'protect' });
  });

  it('returns unknown for a status this client does not know', () => {
    expect(getSignInNextStep(signIn({ status: 'needs_something_new' }))).toEqual({ type: 'unknown' });
  });
});

describe('getSignUpNextStep', () => {
  it('returns start before the sign-up is created', () => {
    expect(getSignUpNextStep(signUp({ id: undefined, status: null }))).toEqual({ type: 'start' });
  });

  it('returns unknown for a created sign-up with no status', () => {
    expect(getSignUpNextStep(signUp({ status: null }))).toEqual({ type: 'unknown' });
  });

  it('returns start for a sign-up future that has not been created', () => {
    const signUpFuture: SignUpNextStepInput = {
      status: 'missing_requirements',
      protectCheck: null,
      isTransferable: false,
      missingFields: [],
      unverifiedFields: [],
      emailAddress: null,
      phoneNumber: null,
      verifications: { emailAddress: { nextAction: '' }, phoneNumber: { nextAction: '' } },
      createdSessionId: null,
    };
    expect(getSignUpNextStep(signUpFuture)).toEqual({ type: 'start' });
  });

  it('returns complete with the created session', () => {
    expect(getSignUpNextStep(signUp({ status: 'complete', createdSessionId: 'sess_1' }))).toEqual({
      type: 'complete',
      createdSessionId: 'sess_1',
    });
  });

  it('returns protect for a protect check resource', () => {
    expect(getSignUpNextStep(signUp({ protectCheck, missingFields: ['username'] }))).toEqual({ type: 'protect' });
  });

  it('returns protect for a protect_check missing field', () => {
    expect(getSignUpNextStep(signUp({ missingFields: ['protect_check', 'username'] }))).toEqual({ type: 'protect' });
  });

  it('returns transfer for a transferable sign-up', () => {
    expect(getSignUpNextStep(signUp({ isTransferable: true, missingFields: ['username'] }))).toEqual({
      type: 'transfer',
    });
  });

  it('puts enterprise SSO before other missing fields', () => {
    expect(getSignUpNextStep(signUp({ missingFields: ['enterprise_sso', 'username'] }))).toEqual({
      type: 'enterprise_sso',
    });
  });

  it('collects missing fields, including legal acceptance', () => {
    expect(getSignUpNextStep(signUp({ missingFields: ['username', 'legal_accepted'] }))).toEqual({
      type: 'fields',
      fields: ['username', 'legal_accepted'],
    });
  });

  it('collects missing fields before verifying the email', () => {
    expect(getSignUpNextStep(signUp({ missingFields: ['username'], unverifiedFields: ['email_address'] }))).toEqual({
      type: 'fields',
      fields: ['username'],
    });
  });

  it('verifies the email before the phone', () => {
    const step = getSignUpNextStep(
      signUp({
        unverifiedFields: ['phone_number', 'email_address'],
        emailAddress: 'ada@example.com',
        phoneNumber: '+15555550142',
      }),
    );
    expect(step).toEqual({ type: 'verify_email', target: 'ada@example.com', sent: false });
  });

  it('verifies the phone once the email is verified', () => {
    const step = getSignUpNextStep(signUp({ unverifiedFields: ['phone_number'], phoneNumber: '+15555550142' }));
    expect(step).toEqual({ type: 'verify_phone', target: '+15555550142', sent: false });
  });

  it('marks a pending email link as sent', () => {
    const step = getSignUpNextStep(
      signUp({
        unverifiedFields: ['email_address'],
        emailAddress: 'ada@example.com',
        verifications: { emailAddress: { nextAction: 'needs_attempt' }, phoneNumber: { nextAction: '' } },
      }),
    );
    expect(step).toEqual({ type: 'verify_email', target: 'ada@example.com', sent: true });
  });

  it('returns unknown for an abandoned sign-up', () => {
    expect(getSignUpNextStep(signUp({ status: 'abandoned' }))).toEqual({ type: 'unknown' });
  });

  it('returns unknown when nothing is missing but the sign-up is not complete', () => {
    expect(getSignUpNextStep(signUp({}))).toEqual({ type: 'unknown' });
  });
});
