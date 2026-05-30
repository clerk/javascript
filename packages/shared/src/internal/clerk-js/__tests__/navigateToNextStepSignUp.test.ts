import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SignUpField, SignUpResource } from '@/types';

import { navigateToNextStepSignUp } from '../navigateToNextStepSignUp';

const mockNavigate = vi.fn();

const URLS = {
  continueSignUpUrl: 'https://app.test/sign-up/continue',
  verifyEmailAddressUrl: 'https://app.test/sign-up/verify-email-address',
  verifyPhoneNumberUrl: 'https://app.test/sign-up/verify-phone-number',
};

describe('navigateToNextStepSignUp', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
  });

  it('navigates to the continue page when there are missing fields', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: ['first_name'] as SignUpField[],
      unverifiedFields: [],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(URLS.continueSignUpUrl);
  });

  it('navigates to verify-email-address when email is unverified and there are no missing fields', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(URLS.verifyEmailAddressUrl, { searchParams: new URLSearchParams() });
  });

  it('navigates to verify-phone-number when phone is unverified and there are no missing fields', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['phone_number'],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(URLS.verifyPhoneNumberUrl, { searchParams: new URLSearchParams() });
  });

  it('prefers email verification over phone verification when both are unverified', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address', 'phone_number'],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(URLS.verifyEmailAddressUrl, { searchParams: new URLSearchParams() });
  });

  it('prefers the continue page when there are both missing fields and unverified fields', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: ['first_name'] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(URLS.continueSignUpUrl);
  });

  it('does nothing when sign-up has no missing fields and no unverified fields', async () => {
    const signUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: [],
    } as unknown as SignUpResource;

    await navigateToNextStepSignUp({
      signUp,
      missingFields: signUp.missingFields,
      ...URLS,
      navigate: mockNavigate,
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
