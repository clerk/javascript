import { describe, expect, it } from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { createFixture } from '../../utils/test/createFixture';
import { SignInStart } from './SignInStart';

describe('SignInStart', () => {
  it('renders the component', () => {
    const { MockClerkProvider } = createFixture();

    render(
      <MockClerkProvider>
        <SignInStart />
      </MockClerkProvider>,
    );

    const component = screen.getByText('Sign in');
    // const googleOauth = screen.getByText('Continue with Google');
    // const discordOauth = screen.getByText('Continue with Discord');
    // const instagramOauth = container.getElementsByClassName('cl-socialButtonsIconButton__instagram');

    expect(component).toBeDefined();
    // expect(googleOauth).toBeDefined();
    // expect(discordOauth).toBeDefined();
    // expect(instagramOauth).toBeDefined();

    // updateMock(mocks => {
    //   // TBD, use as a sample only
    //   mocks.client.signIn.create.mockOnceAndReturn(Promise.resolve({ status: '...' }));
    // });
  });

  describe('Login Methods', () => {
    it('enables login with email address', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withEmailAddress();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const text = screen.getByText('Email address');

      expect(text).toBeDefined();
    });

    it('enables login with username', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withUsername();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const text = screen.getByText('Username');

      expect(text).toBeDefined();
    });

    it('enables login with phone number', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withPhoneNumber();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const text = screen.getByText('Phone number');

      expect(text).toBeDefined();
    });

    it('enables login with all three (email address, phone number, username)', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withPhoneNumber();
        f.withUsername();
        f.withEmailAddress();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const text = screen.getByText('Email address, phone number or username');

      expect(text).toBeDefined();
    });
  });

  describe('Social OAuth', () => {
    it('shows the Continue with Google social OAuth button', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withGoogleOAuth();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const socialOAuth = screen.getByText('Continue with Google');
      expect(socialOAuth).toBeDefined();
    });

    it('shows the Continue with Discord social OAuth button', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withDiscordOAuth();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const socialOAuth = screen.getByText('Continue with Discord');
      expect(socialOAuth).toBeDefined();
    });

    it('shows the Continue with Instagram social OAuth button', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withInstagramOAuth();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      const socialOAuth = screen.getByText('Continue with Instagram');
      expect(socialOAuth).toBeDefined();
    });

    it('shows the social buttons when 3 or more social login methods are enabled', () => {
      const { MockClerkProvider } = createFixture(f => {
        f.withDiscordOAuth();
        f.withInstagramOAuth();
        f.withGoogleOAuth();
      });

      const { container } = render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      // target the css classname as this is public API
      const googleIcon = container.getElementsByClassName('cl-socialButtonsIconButton__google');
      const instagramIcon = container.getElementsByClassName('cl-socialButtonsIconButton__instagram');
      const discordIcon = container.getElementsByClassName('cl-socialButtonsIconButton__discord');
      expect(googleIcon).toBeDefined();
      expect(instagramIcon).toBeDefined();
      expect(discordIcon).toBeDefined();
    });
  });

  describe('navigation', () => {
    it('calls create on clicking Continue button', async () => {
      let mockCreateFn: any;
      const { MockClerkProvider } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      fireEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(mockCreateFn).toHaveBeenCalled();
      });
    });

    it('nav', async () => {
      let mockCreateFn: any;
      let mockRouteNavigateFn: any;
      const { MockClerkProvider } = createFixture(f => {
        f.withEmailAddress();
        mockCreateFn = f.mockSignInCreate({ responseStatus: 'needs_first_factor' });
        mockRouteNavigateFn = f.mockRouteNavigate();
      });

      render(
        <MockClerkProvider>
          <SignInStart />
        </MockClerkProvider>,
      );

      fireEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(mockCreateFn).toHaveBeenCalled();
        expect(mockRouteNavigateFn).toHaveBeenCalledWith('factor-one');
      });
    });
  });
});
