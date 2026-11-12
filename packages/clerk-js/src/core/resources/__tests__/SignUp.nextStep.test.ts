import { getSignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';
import { describe, expect, it } from 'vitest';

import { SignUp } from '../SignUp';

describe('getSignUpNextStep with the SignUp resource', () => {
  it('returns start for a sign-up that has not been created', () => {
    const signUp = new SignUp(null);

    expect(getSignUpNextStep(signUp.__internal_future)).toEqual({ type: 'start' });
  });

  it('returns fields for a created sign-up with missing fields', () => {
    const signUp = new SignUp({
      object: 'sign_up',
      id: 'sua_1',
      status: 'missing_requirements',
      required_fields: ['email_address', 'password'],
      optional_fields: [],
      missing_fields: ['password'],
      unverified_fields: [],
      verifications: null,
      username: null,
      first_name: null,
      last_name: null,
      email_address: 'ada@example.com',
      phone_number: null,
      web3_wallet: null,
      external_account_strategy: null,
      external_account: null,
      has_password: false,
      unsafe_metadata: {},
      created_session_id: null,
      created_user_id: null,
      abandon_at: null,
      legal_accepted_at: null,
      locale: null,
      timezone: null,
    });

    expect(getSignUpNextStep(signUp.__internal_future)).toEqual({ type: 'fields', fields: ['password'] });
  });
});
