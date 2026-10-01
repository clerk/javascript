import type { Clerk } from '@clerk/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HashRouter, PathRouter, Route, useRouter } from '../../../router';
import { buildCombinedFlowOAuthCallbackParams } from '../buildOAuthCallbackParams';

const mockNavigate = vi.fn();

vi.mock('@clerk/shared/react', () => {
  return {
    useClerk: () => {
      return {
        navigate: (to: string) => {
          mockNavigate(to);
          return Promise.resolve();
        },
      } as Clerk;
    },
  };
});

const params = buildCombinedFlowOAuthCallbackParams({
  signUpUrl: '/sign-in#/create',
  signInUrl: '/sign-in',
} as any);

const destinations = [
  ['signInProtectCheckUrl', params.signInProtectCheckUrl!, 'protect-check'],
  ['firstFactorUrl', params.firstFactorUrl!, 'factor-one'],
  ['secondFactorUrl', params.secondFactorUrl!, 'factor-two'],
  ['resetPasswordUrl', params.resetPasswordUrl!, 'reset-password'],
  ['continueSignUpUrl', params.continueSignUpUrl!, 'create/continue'],
] as const;

const NavigateButton = ({ to }: { to: string }) => {
  const router = useRouter();
  return (
    <button
      type='button'
      onClick={() => void router.navigate(to)}
    >
      {to}
    </button>
  );
};

const CallbackRoute = () => (
  <Route path='create'>
    <Route path='sso-callback'>
      {destinations.map(([name, to]) => (
        <NavigateButton
          key={name}
          to={to}
        />
      ))}
    </Route>
  </Route>
);

describe('combined-flow create/sso-callback route', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  describe.each([
    ['mounted at the root', '/sign-in', '/sign-in/create/sso-callback'],
    ['mounted at a nested path', '/auth/sign-in', '/auth/sign-in/create/sso-callback'],
    ['reached with a trailing slash', '/sign-in', '/sign-in/create/sso-callback/'],
  ])('with path routing %s', (_, basePath, callbackPath) => {
    it.each(destinations)('resolves %s to the %s step', async (_name, to, step) => {
      window.history.replaceState({}, '', callbackPath);
      render(
        <PathRouter basePath={basePath}>
          <CallbackRoute />
        </PathRouter>,
      );

      await userEvent.click(screen.getByRole('button', { name: to }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`${basePath}/${step}`);
      });
    });
  });

  describe('with hash routing', () => {
    it.each(destinations)('resolves %s to the %s step', async (_name, to, step) => {
      window.history.replaceState({}, '', '/#/create/sso-callback');
      render(
        <HashRouter>
          <CallbackRoute />
        </HashRouter>,
      );

      await userEvent.click(screen.getByRole('button', { name: to }));

      await waitFor(() => {
        expect(window.location.hash).toBe(`#/${step}`);
      });
    });
  });
});
