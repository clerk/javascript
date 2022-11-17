import { describe, it, jest } from '@jest/globals';
import React from 'react';
import { createFixture as _createFixture, render, screen } from 'testUtils';

import { SignInFactorOne } from '../SignInFactorOne';

const createFixture = _createFixture('SignIn');

describe('SignInFactorOne', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixture(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
    render(<SignInFactorOne />, { wrapper });
    screen.getByText(/Check your email/i);
  });

  it.todo('prefills the email if the identifier is an email');
  it.todo('prefills the phone number if the identifier is a phone number');

  describe('Navigation', () => {
    it.todo('navigates to SignInStart component when user clicks the edit icon');
    it('navigates to SignInStart component if the user lands on SignInFactorOne directly without calling signIn.create', async () => {
      let spy: any;
      const { wrapper, fixtures } = await createFixture(f => {
        spy = f.mockRouteNavigate();
      });
      render(<SignInFactorOne />, { wrapper });
      expect(spy).toHaveBeenCalledWith('../');
    });
  });

  describe('Submitting', () => {
    it.todo('navigates to SignInFactorTwo page when user submits first factor and second factor is enabled');
    it.todo('sets an active session when user submits first factor successfully and second factor does not exist');
  });

  describe('Selected First Factor Method', () => {
    describe('Password', () => {
      it('shows an input to fill with password', async () => {
        const { wrapper } = await createFixture(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: true });
        });
        render(<SignInFactorOne />, { wrapper });
        screen.getByText('Password');
      });

      it.todo('should render the other authentication methods list component when clicking on "Forgot password"');
      it.todo('shows a UI error when user clicks the continue button with password field empty');
      it.todo('shows a UI error when submission fails');
    });

    describe('Verification link', () => {
      it('shows message to use the magic link in their email', async () => {
        const { wrapper, fixtures } = await createFixture(f => {
          f.withEmailAddress();
          f.withMagicLink();
          f.startSignInWithEmailAddress({ supportEmailLink: true, supportPassword: false });
        });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
        fixtures.signIn.createMagicLinkFlow.mockImplementation(
          () =>
            ({
              startMagicLinkFlow: jest.fn(() => new Promise(() => {})),
              cancelMagicLinkFlow: jest.fn(() => new Promise(() => {})),
            } as any),
        );

        render(<SignInFactorOne />, { wrapper });
        screen.getByText(/Use the verification link sent your email/i);
      });

      it.todo('enables the "Resend link" button after 60 seconds');
      it.todo('shows message to use the magic link in their email');
    });

    describe('Email Code', () => {
      it('shows an input to add the code sent to email', async () => {
        const { wrapper, fixtures } = await createFixture(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportEmailCode: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
        render(<SignInFactorOne />, { wrapper });
        screen.getByText(/Enter the verification code sent to your email address/i);
      });

      it.todo('enables the "Resend code" button after 30 seconds');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });

    describe('Phone Code', () => {
      it('shows an input to add the code sent to phone', async () => {
        const { wrapper, fixtures } = await createFixture(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
        render(<SignInFactorOne />, { wrapper });
        screen.getByText(/Enter the verification code sent to your phone number/i);
      });

      it.todo('enables the "Resend code" button after 30 seconds');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });
  });

  describe('Use another method', () => {
    it.todo('should render the other authentication methods list component when clicking on "Use another method"');
    it.todo('should go back to the main screen when clicking the "<- Back" button');
    it.todo('should list all the enabled first factor methods');
    it.todo('clicking the password method should show the password input');
    it.todo('clicking the email link method should show the magic link screen');
    it.todo('clicking the email code method should show the email code input');
    it.todo('clicking the phone code method should show the phone code input');

    describe('Get Help', () => {
      it.todo('should render the get help component when clicking the "Get Help" button');
      it.todo('should go back to "Use another method" screen when clicking the "<- Back" button');
      it.todo('should open a "mailto:" link when clicking the email support button');
    });
  });
});
