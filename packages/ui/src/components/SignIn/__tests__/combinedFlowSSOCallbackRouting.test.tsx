import type { Clerk } from '@clerk/shared/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PathRouter, Route, useRouter } from '../../../router';
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

const CombinedFlowSSOCallback = () => (
  <PathRouter basePath='/sign-in'>
    <Route path='create'>
      <Route path='sso-callback'>
        <NavigateButton to={params.signInProtectCheckUrl!} />
        <NavigateButton to={params.firstFactorUrl!} />
        <NavigateButton to={params.secondFactorUrl!} />
        <NavigateButton to={params.resetPasswordUrl!} />
        <NavigateButton to={params.continueSignUpUrl!} />
      </Route>
    </Route>
  </PathRouter>
);

describe('combined-flow create/sso-callback route', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    window.history.replaceState({}, '', '/sign-in/create/sso-callback');
  });

  it.each([
    [params.signInProtectCheckUrl!, '/sign-in/protect-check'],
    [params.firstFactorUrl!, '/sign-in/factor-one'],
    [params.secondFactorUrl!, '/sign-in/factor-two'],
    [params.resetPasswordUrl!, '/sign-in/reset-password'],
    [params.continueSignUpUrl!, '/sign-in/create/continue'],
  ])('resolves %s to %s', async (to, expected) => {
    render(<CombinedFlowSSOCallback />);

    await userEvent.click(screen.getByRole('button', { name: to }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expected);
    });
  });
});
