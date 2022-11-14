import { OAUTH_PROVIDERS } from '@clerk/types';
import React from 'react';

import { createFixture as _createFixture, render, screen } from '../../../testUtils';
import { SignInStart } from './SignInStart';

const createFixture = _createFixture('SignIn');

describe('SignInStart', () => {
  it('renders the component', () => {
    const { wrapper } = createFixture();
    render(<SignInStart />, { wrapper });
    screen.getByText('Sign in');
  });

  describe('Login Methods', () => {
    it('enables login with email address', () => {
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
    });

    it('enables login with username', () => {
      const { wrapper } = createFixture(f => {
        f.withUsername();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/username/i);
    });

    it('enables login with phone number', () => {
      const { wrapper } = createFixture(f => {
        f.withPhoneNumber();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText('Phone number');
    });

    it('enables login with all three (email address, phone number, username)', () => {
      const { wrapper } = createFixture(f => {
        f.withPhoneNumber();
        f.withUsername();
        f.withEmailAddress();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/email address, phone number or username/i);
    });
  });

  describe('Social OAuth', () => {
    it.each(OAUTH_PROVIDERS)('shows the "Continue with $name" social OAuth button', ({ provider, name }) => {
      const { wrapper } = createFixture(f => {
        f.withSocialOAuth(provider);
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(`Continue with ${name}`);
      expect(socialOAuth).toBeDefined();
    });

    it('uses the "cl-socialButtonsIconButton__SOCIALOAUTHNAME" classname when rendering the social button icon only', () => {
      const { wrapper } = createFixture(f => {
        OAUTH_PROVIDERS.forEach(providerData => {
          f.withSocialOAuth(providerData.provider);
        });
      });

      const { container } = render(<SignInStart />, { wrapper });

      // target the css classname as this is public API
      OAUTH_PROVIDERS.forEach(providerData => {
        const icon = container.getElementsByClassName(`cl-socialButtonsIconButton__${providerData.provider}`);
        expect(icon.length).toEqual(1);
      });
    });
  });

  describe('navigation', () => {
    it('calls create on clicking Continue button', async () => {
      const { wrapper, mocks } = createFixture(f => {
        f.withEmailAddress();
      });
      // TODO:
      mocks.client.signIn.create.mockReturnValueOnce({ status: 'needs_first_factor' });
      const { user } = render(<SignInStart />, { wrapper });
      await user.type(screen.getByLabelText(/email address/i), 'hello@clerk.dev');
      await user.click(screen.getByText('Continue'));
      expect(mocks.client.signIn.create).toHaveBeenCalled();
    });

    it('navigates to /factor-one page when user clicks on Continue button and create needs a first factor', async () => {
      let mockCreateFn: any;
      let mockRouteNavigateFn: any;
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate({ responseStatus: 'needs_first_factor' });
        mockRouteNavigateFn = f.mockRouteNavigate();
      });

      const { user } = render(<SignInStart />, { wrapper });
      await user.type(screen.getByLabelText(/email address/i), 'hello@clerk.dev');
      await user.click(screen.getByText('Continue'));
      expect(mockCreateFn).toHaveBeenCalled();
      expect(mockRouteNavigateFn).toHaveBeenCalledWith('factor-one');
    });

    it('navigates to /factor-two page when user clicks on Continue button and create needs a second factor', async () => {
      let mockCreateFn: any;
      let mockRouteNavigateFn: any;
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate({ responseStatus: 'needs_second_factor' });
        mockRouteNavigateFn = f.mockRouteNavigate();
      });

      const { user } = render(<SignInStart />, { wrapper });
      expect(screen.getByText('Continue')).toBeInTheDocument();
      await user.type(screen.getByLabelText(/email address/i), 'hello@clerk.dev');
      await user.click(screen.getByText('Continue'));
      expect(mockCreateFn).toHaveBeenCalled();
      expect(mockRouteNavigateFn).toHaveBeenCalledWith('factor-two');
    });
  });
});
