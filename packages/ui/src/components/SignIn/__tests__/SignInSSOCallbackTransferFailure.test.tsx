import { ClerkAPIResponseError } from '@clerk/shared/error';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { PathRouter } from '../../../router';
import { SignIn } from '../index';

const { createFixtures } = bindCreateFixtures('SignIn');

const SSO_CALLBACK_BOUNCE_DELAY = 4000;

const ACCOUNT_NOT_FOUND = /The External Account was not found/i;
const GENERIC_ERROR = /Unable to complete action at this time/i;
const RATE_LIMITED = /Too many requests\. Please try again in a bit\./i;

const setup = async () => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withEmailAddress();
    f.withSocialProvider({ provider: 'google' });
  });

  fixtures.signIn.firstFactorVerification = {
    status: 'transferable',
    strategy: 'oauth_google',
    error: {
      code: 'external_account_not_found',
      message: 'Invalid external account',
      longMessage: 'The External Account was not found.',
    },
  } as any;
  vi.mocked(fixtures.clerk.navigate).mockImplementation((to: string) => {
    const url = new URL(to, window.location.href);
    if (url.origin === window.location.origin) {
      window.history.pushState({}, '', url.href);
    }
    return Promise.resolve();
  });

  let lastError: unknown = null;
  Object.defineProperty(fixtures.clerk, '__internal_last_error', {
    configurable: true,
    get() {
      const value = lastError;
      lastError = null;
      return value;
    },
    set(value: unknown) {
      lastError = value;
    },
  });
  window.Clerk = fixtures.clerk as typeof window.Clerk;

  return { wrapper, fixtures };
};

const renderAt = (path: string, wrapper: React.FC<{ children: React.ReactNode }>) => {
  window.history.replaceState({}, '', path);
  return render(
    <React.Suspense fallback={null}>
      <PathRouter basePath='/sign-in'>
        <SignIn />
      </PathRouter>
    </React.Suspense>,
    { wrapper },
  );
};

const waitForBounce = () =>
  waitFor(() => expect(window.location.pathname).toBe('/sign-in'), { timeout: SSO_CALLBACK_BOUNCE_DELAY + 2000 });

describe('SignIn SSO callback when the sign-up transfer fails', () => {
  const originalClerk = window.Clerk;
  afterEach(() => {
    window.Clerk = originalClerk;
  });

  it(
    'keeps showing the API error after bouncing back to the start screen',
    async () => {
      const { wrapper, fixtures } = await setup();
      vi.mocked(fixtures.clerk.handleRedirectCallback).mockRejectedValue(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'too_many_requests',
              message: 'Too many requests',
              long_message: 'Too many requests. Please try again in a bit.',
            },
          ],
          status: 429,
        }),
      );

      renderAt('/sign-in/sso-callback', wrapper);

      expect(await screen.findByText(RATE_LIMITED)).toBeInTheDocument();
      await waitForBounce();
      expect(await screen.findByText(RATE_LIMITED)).toBeInTheDocument();
      expect(screen.queryByText(ACCOUNT_NOT_FOUND)).not.toBeInTheDocument();
      expect(fixtures.signIn.create).toHaveBeenCalledWith({});
    },
    SSO_CALLBACK_BOUNCE_DELAY + 6000,
  );

  it(
    'keeps showing the generic error after bouncing back when the transfer response is not a Clerk error',
    async () => {
      const { wrapper, fixtures } = await setup();
      vi.mocked(fixtures.clerk.handleRedirectCallback).mockRejectedValue(
        new SyntaxError('Unexpected token < in JSON at position 0'),
      );

      renderAt('/sign-in/sso-callback', wrapper);

      expect(await screen.findByText(GENERIC_ERROR)).toBeInTheDocument();
      await waitForBounce();
      expect(await screen.findByText(GENERIC_ERROR)).toBeInTheDocument();
      expect(screen.queryByText(ACCOUNT_NOT_FOUND)).not.toBeInTheDocument();
      expect(fixtures.signIn.create).toHaveBeenCalledWith({});
    },
    SSO_CALLBACK_BOUNCE_DELAY + 6000,
  );

  it('still tells the user their account was not found when they land on the start screen with a transferable sign-in', async () => {
    const { wrapper, fixtures } = await setup();

    renderAt('/sign-in', wrapper);

    expect(await screen.findByText(ACCOUNT_NOT_FOUND)).toBeInTheDocument();
    expect(screen.queryByText(GENERIC_ERROR)).not.toBeInTheDocument();
    expect(fixtures.signIn.create).toHaveBeenCalledWith({});
  });
});
