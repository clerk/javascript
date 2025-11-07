import { ClerkAPIResponseError } from '@clerk/shared/error';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

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

  it('renders the component if there is a persisted sign up and legal accepted is missing and email address is unverified', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withPassword({ required: true });
      f.startSignUpWithMissingLegalAcceptedAndUnverifiedFields();
      f.withLegalConsent();
      f.withTermsPrivacyPolicyUrls({
        privacyPolicy: 'https://clerk.dev/privacy',
        termsOfService: 'https://clerk.dev/tos',
      });
    });
    const screen = render(<SignUpContinue />, { wrapper });
    expect(screen.queryByText(/email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Terms Of Service/i)).toBeInTheDocument();
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

  it('does not render web3 providers', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUsername({ required: true });
      f.startSignUpWithEmailAddress();
      f.withSocialProvider({ provider: 'google' });
      f.withWeb3Wallet();
    });

    const { queryByAltText } = render(<SignUpContinue />, { wrapper });
    expect(queryByAltText(/sign in with metamask/i)).not.toBeInTheDocument();
  });

  it('renders error for invalid username length', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withUsername({ required: true });
      f.startSignUpWithEmailAddress({
        emailVerificationStatus: 'verified',
      });
    });

    fixtures.signUp.update.mockRejectedValue(
      new ClerkAPIResponseError('Error', {
        data: [
          {
            code: 'form_username_invalid_length',
            long_message: 'some server error',
            message: 'some server error',
            meta: { param_name: 'username' },
          },
        ],
        status: 400,
      }),
    );

    const { userEvent } = render(<SignUpContinue />, { wrapper });
    expect(screen.queryByText(/username/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/username/i), 'clerkUser');
    const button = screen.getByText('Continue');
    await userEvent.click(button);

    await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalled());
    const errorElement = await screen.findByTestId('form-feedback-error');
    expect(errorElement).toHaveTextContent(/Your username must be between 4 and 40 characters long/i);
  });

  it('renders error for existing username', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.withUsername({ required: true });
      f.startSignUpWithEmailAddress({
        emailVerificationStatus: 'verified',
      });
    });

    fixtures.signUp.update.mockRejectedValue(
      new ClerkAPIResponseError('Error', {
        data: [
          {
            code: 'form_identifier_exists',
            long_message: 'This username is taken. Please try another.',
            message: 'some server error',
            meta: { param_name: 'username' },
          },
        ],
        status: 400,
      }),
    );

    const { userEvent } = render(<SignUpContinue />, { wrapper });
    expect(screen.queryByText(/username/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/username/i), 'clerkUser');
    const button = screen.getByText('Continue');
    await userEvent.click(button);

    await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalled());
    const errorElement = await screen.findByTestId('form-feedback-error');
    expect(errorElement).toHaveTextContent(/This username is taken. Please try another/i);
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
