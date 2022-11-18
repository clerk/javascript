import { describe, it, jest } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignInFactorOne } from '../SignInFactorOne';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorOne', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
    render(<SignInFactorOne />, { wrapper });
    screen.getByText('Check your email');
  });

  it.todo('prefills the email if the identifier is an email');
  it.todo('prefills the phone number if the identifier is a phone number');

  describe('Navigation', () => {
    it.todo('navigates to SignInStart component when user clicks the edit icon');
    it('navigates to SignInStart component if the user lands on SignInFactorOne directly without calling signIn.create', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {});
      render(<SignInFactorOne />, { wrapper });
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
    });
  });

  describe('Submitting', () => {
    it.todo('navigates to SignInFactorTwo page when user submits first factor and second factor is enabled');
    it.todo('sets an active session when user submits first factor successfully and second factor does not exist');
  });

  describe('Selected First Factor Method', () => {
    describe('Password', () => {
      it('shows an input to fill with password', async () => {
        const { wrapper } = await createFixtures(f => {
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
        const { wrapper, fixtures } = await createFixtures(f => {
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
        screen.getByText('Use the verification link sent your email');
      });

      it.todo('enables the "Resend link" button after 60 seconds');
      it.todo('shows message to use the magic link in their email');
    });

    describe('Email Code', () => {
      it('shows an input to add the code sent to email', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportEmailCode: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
        render(<SignInFactorOne />, { wrapper });
        screen.getByText('Enter the verification code sent to your email address');
      });

      it.todo('enables the "Resend code" button after 30 seconds');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });

    describe('Phone Code', () => {
      it('shows an input to add the code sent to phone', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
        render(<SignInFactorOne />, { wrapper });
        screen.getByText('Enter the verification code sent to your phone number');
      });

      it.todo('enables the "Resend code" button after 30 seconds');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });
  });

  describe('Use another method', () => {
    it('should render the other authentication methods list component when clicking on "Use another method"', async () => {
      const email = 'test@clerk.dev';
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
        f.withPassword();
        f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true, identifier: email });
      });

      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      screen.getByText(`Send code to ${email}`);
      screen.getByText(`Send link to ${email}`);
      screen.getByText(`Sign in with your password`);
    });

    it('should go back to the main screen ommwhen clicking the "<- Back" button from the "Use another method" page', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });

      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await userEvent.click(screen.getByText('Back'));
      screen.getByText('Enter your password');
    });

    it('should list all the enabled first factor methods', async () => {
      const email = 'test@clerk.dev';
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInWithEmailAddress({ supportEmailCode: true, identifier: email });
      });
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      screen.getByText(`Send code to ${email}`);
      screen.getByText(`Sign in with your password`);
      const deactivatedMethod = screen.queryByText(`Send link to ${email}`);
      expect(deactivatedMethod).not.toBeInTheDocument();
    });

    it('clicking the password method should show the password input', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await userEvent.click(screen.getByText('Sign in with your password'));
      screen.getByText('Enter your password');
    });

    it('clicking the email link method should show the magic link screen', async () => {
      const email = 'test@clerk.dev';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailLink: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
      fixtures.signIn.createMagicLinkFlow.mockImplementation(
        () =>
          ({
            startMagicLinkFlow: jest.fn(() => new Promise(() => {})),
            cancelMagicLinkFlow: jest.fn(() => new Promise(() => {})),
          } as any),
      );
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      screen.getByText(`Send link to ${email}`);
      await userEvent.click(screen.getByText(`Send link to ${email}`));
      screen.getByText('Check your email');
      screen.getByText('Verification link');
    });

    it('clicking the email code method should show the email code input', async () => {
      const email = 'test@clerk.dev';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailCode: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
      fixtures.signIn.createMagicLinkFlow.mockReturnValue({
        startMagicLinkFlow: jest.fn(() => new Promise(() => {})),
        cancelMagicLinkFlow: jest.fn(() => new Promise(() => {})),
      } as any);
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      screen.getByText(`Send code to ${email}`);
      await userEvent.click(screen.getByText(`Send code to ${email}`));
      screen.getByText('Check your email');
      screen.getByText('Verification code');
    });

    it('clicking the phone code method should show the phone code input', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve());
      fixtures.signIn.createMagicLinkFlow.mockReturnValue({
        startMagicLinkFlow: jest.fn(() => new Promise(() => {})),
        cancelMagicLinkFlow: jest.fn(() => new Promise(() => {})),
      } as any);
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      screen.getByText(/Send code to \+/);
      await userEvent.click(screen.getByText(/Send code to \+/));
      screen.getByText('Check your phone');
    });

    describe('Get Help', () => {
      it('should render the get help component when clicking the "Get Help" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Get help'));
        screen.getByText('Email support');
      });

      it('should go back to "Use another method" screen when clicking the "<- Back" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Get help'));
        await userEvent.click(screen.getByText('Back'));
        screen.getByText('Use another method');
      });

      it('should open a "mailto:" link when clicking the email support button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Get help'));
        screen.getByText('Email support');
        await userEvent.click(screen.getByText('Email support'));
        //TODO: check that location.href setter is called
      });
    });
  });
});
