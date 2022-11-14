import { describe, it } from '@jest/globals';
import React from 'react';
import { createFixture as _createFixture, render, screen } from 'testUtils';

import { SignInFactorOne } from './SignInFactorOne';

const createFixture = _createFixture('SignIn');

describe('SignInFactorOne', () => {
  it('renders the component and shows input prompt for password', () => {
    const { wrapper } = createFixture(f => {
      f.withEmailAddress();
      f.withAuthFirstFactor('password');
    });
    render(<SignInFactorOne />, { wrapper });
    screen.getByText(/Clerk Test App/i);
    screen.getByText('Password');
  });

  it('prompts user to click the magic link in his email', () => {
    const { wrapper } = createFixture(f => {
      f.withEmailAddress();
      f.withAuthFirstFactor('email_link');
    });

    render(<SignInFactorOne />, { wrapper });
    screen.getByText(/Use the verification link sent your email/i);
  });

  it('shows an input to add the code sent to email', () => {
    const { wrapper } = createFixture(f => {
      f.withEmailAddress();
      f.withAuthFirstFactor('email_code');
    });

    render(<SignInFactorOne />, { wrapper });
    screen.getByText(/Use the verification link sent your email/i);
  });

  it('shows an input to add the code sent to phone', () => {
    const { wrapper } = createFixture(f => {
      f.withEmailAddress();
      f.withPhoneNumber();
      f.withAuthFirstFactor('phone_code');
    });

    render(<SignInFactorOne />, { wrapper });
    screen.getByText('Verification code');
  });
});
