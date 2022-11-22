import { OAUTH_PROVIDERS } from '@clerk/types';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpContinue } from '../SignUpContinue';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpContinue', () => {
  it('renders the component if there is a persisted sign up', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress();
    });
    render(<SignUpContinue />, { wrapper });
    screen.getByText(/missing/i);
  });

  it('does not render the form if there is not a persisted sign up', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
    });
    render(<SignUpContinue />, { wrapper });
    expect(screen.queryByText(/missing/i)).toBeNull();
  });

  it('navigates to the sign up page if there is not a persisted sign up', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
    });
    render(<SignUpContinue />, { wrapper });
    expect(fixtures.router.navigate).toHaveBeenCalledWith(fixtures.environment.displayConfig.signUpUrl);
  });

  it('shows the fields for the sign up', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress();
    });
    render(<SignUpContinue />, { wrapper });
    screen.getByText(/email address/i);
    screen.getByText(/password/i);
  });

  it('shows the continue button', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress();
    });
    render(<SignUpContinue />, { wrapper });
    const button = screen.getByText('Continue');
    expect(button.tagName.toUpperCase()).toBe('BUTTON');
  });

  it.each(OAUTH_PROVIDERS)('shows the "Continue with $name" social OAuth button', async ({ provider, name }) => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress();
      f.withSocialProvider({ provider });
    });

    render(<SignUpContinue />, { wrapper });
    screen.getByText(`Continue with ${name}`);
  });

  describe('Sign in Link', () => {
    it('Shows the Sign In message with the appropriate link', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPassword({ required: true });
        f.startSignUpWithEmailAddress();
      });
      render(<SignUpContinue />, { wrapper });

      const signInLink = screen.getByText('Have an account?').nextElementSibling;
      expect(signInLink?.textContent).toBe('Sign in');
      expect(signInLink?.tagName.toUpperCase()).toBe('A');
      expect(signInLink?.getAttribute('href')).toMatch(fixtures.environment.displayConfig.signInUrl);
    });
  });
});
