import { describe, expect, it } from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { createFixture } from '../../utils/test/createFixture';
import { SignInStart } from './SignInStart';

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
    it('shows the Continue with Google social OAuth button', () => {
      const { wrapper } = createFixture(f => {
        f.withSocialOAuth('google');
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(/continue with google/i);
      expect(socialOAuth).toBeDefined();
    });

    it('shows the Continue with Discord social OAuth button', () => {
      const { wrapper } = createFixture(f => {
        f.withSocialOAuth('discord');
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(/continue with discord/i);
      expect(socialOAuth).toBeDefined();
    });

    it('shows the Continue with Instagram social OAuth button', () => {
      const { wrapper } = createFixture(f => {
        f.withSocialOAuth('instagram');
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(/continue with instagram/i);
      expect(socialOAuth).toBeDefined();
    });

    it('shows the social buttons when 3 or more social login methods are enabled', () => {
      const { wrapper } = createFixture(f => {
        f.withSocialOAuth('google');
        f.withSocialOAuth('instagram');
        f.withSocialOAuth('discord');
      });

      const { container } = render(<SignInStart />, { wrapper });

      // target the css classname as this is public API
      const googleIcon = container.getElementsByClassName('cl-socialButtonsIconButton__google');
      const instagramIcon = container.getElementsByClassName('cl-socialButtonsIconButton__instagram');
      const discordIcon = container.getElementsByClassName('cl-socialButtonsIconButton__discord');
      expect(googleIcon).toBeDefined();
      expect(instagramIcon).toBeDefined();
      expect(discordIcon).toBeDefined();
    });
  });

  describe.skip('navigation', () => {
    it('calls create on clicking Continue button', async () => {
      let mockCreateFn: any;
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate();
      });

      render(<SignInStart />, { wrapper });

      fireEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(mockCreateFn).toHaveBeenCalled();
      });
    });

    it('navigates to /factor-one page when user clicks on Continue button and create needs a first factor', async () => {
      let mockCreateFn: any;
      let mockRouteNavigateFn: any;
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate({ responseStatus: 'needs_first_factor' });
        mockRouteNavigateFn = f.mockRouteNavigate();
      });

      render(<SignInStart />, { wrapper });

      fireEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(mockCreateFn).toHaveBeenCalled();
        expect(mockRouteNavigateFn).toHaveBeenCalledWith('factor-one');
      });
    });

    it('navigates to /factor-two page when user clicks on Continue button and create needs a second factor', async () => {
      let mockCreateFn: any;
      let mockRouteNavigateFn: any;
      const { wrapper } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate({ responseStatus: 'needs_second_factor' });
        mockRouteNavigateFn = f.mockRouteNavigate();
      });

      render(<SignInStart />, { wrapper });

      fireEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(mockCreateFn).toHaveBeenCalled();
        expect(mockRouteNavigateFn).toHaveBeenCalledWith('factor-two');
      });
    });
  });
});
