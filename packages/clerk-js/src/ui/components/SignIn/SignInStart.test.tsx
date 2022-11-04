import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
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
  });
});
