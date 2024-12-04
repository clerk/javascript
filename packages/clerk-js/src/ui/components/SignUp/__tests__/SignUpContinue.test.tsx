import { OAUTH_PROVIDERS } from '@clerk/types';
import React from 'react';

import { render, screen } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
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
    // This will have to be show if the email is already set but it is not verified
    // because if the users tries to edit the email before the first one has verified
    // the email field will be lost
    expect(screen.queryByText(/email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/password/i)).toBeInTheDocument();
  });

  it('does not show email field if has been verified', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress({
        emailVerificationStatus: 'verified',
      });
    });
    render(<SignUpContinue />, { wrapper });
    // This will have to be show if the email is already set but it is not verified
    // because if the users tries to edit the email before the first one has verified
    // the email field will be lost
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password/i)).toBeInTheDocument();
  });

  it('shows the continue button', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithEmailAddress();
    });
    render(<SignUpContinue />, { wrapper });
    const button = screen.getByText('Continue');
    expect(button.tagName.toUpperCase()).toBe('SPAN');
    expect(button.parentElement?.tagName.toUpperCase()).toBe('BUTTON');
  });

  it('renders the component if there is a persisted sign up and legal accepted is missing', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithMissingLegalAccepted();
      f.withLegalConsent();
      f.withTermsPrivacyPolicyUrls({
        privacyPolicy: 'https://clerk.dev/privacy',
        termsOfService: 'https://clerk.dev/tos',
      });
    });
    const screen = render(<SignUpContinue />, { wrapper });
    screen.getByText(/Terms Of Service/i);
    screen.getByText(/Privacy Policy/i);
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

      const signInLink = screen.getByText('Already have an account?').nextElementSibling;
      expect(signInLink?.textContent).toBe('Sign in');
      expect(signInLink?.tagName.toUpperCase()).toBe('A');
      expect(signInLink?.getAttribute('href')).toMatch(fixtures.environment.displayConfig.signInUrl);
    });
  });
});
