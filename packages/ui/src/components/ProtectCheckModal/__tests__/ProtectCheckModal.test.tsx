import { ClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { OptionsProvider } from '../../../contexts';
import { ProtectCheckModal } from '..';

vi.mock('@clerk/shared/internal/clerk-js/protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';

const { createFixtures: createBaseFixtures } = bindCreateFixtures('SignIn');

const createFixtures = async (...args: Parameters<typeof createBaseFixtures>) => {
  const result = await createBaseFixtures(...args);
  result.fixtures.router.currentPath = '/protect-check';
  result.fixtures.router.matches.mockImplementation((path?: string) => path === 'protect-check');
  return result;
};

const mockExecute = executeProtectCheck as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockExecute.mockReset();
});

describe('ProtectCheckModal', () => {
  it('calls onResolved once when it mounts for a resource whose gate is already clear', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const onResolved = vi.fn();
    expect(fixtures.signIn.protectCheck).toBeFalsy();

    render(
      <React.StrictMode>
        <ProtectCheckModal
          resource={fixtures.signIn}
          onResolved={onResolved}
          onFailed={vi.fn()}
        />
      </React.StrictMode>,
      { wrapper },
    );

    await waitFor(() => expect(onResolved).toHaveBeenCalled());
    expect(onResolved).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('runs a chained challenge and only calls onResolved after the last gate clears', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    const onResolved = vi.fn();
    mockExecute.mockResolvedValueOnce('proof-1').mockReturnValueOnce(new Promise(() => {}));
    fixtures.signIn.submitProtectCheck.mockImplementationOnce(() => {
      (fixtures.signIn as any).protectCheck = {
        status: 'pending',
        token: 'challenge-token-2',
        sdkUrl: 'https://protect.example.com/sdk.js',
      };
      return Promise.resolve(fixtures.signIn);
    });

    render(
      <ProtectCheckModal
        resource={fixtures.signIn}
        onResolved={onResolved}
        onFailed={vi.fn()}
      />,
      { wrapper },
    );

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));
    expect(mockExecute.mock.calls[1][0]).toMatchObject({ token: 'challenge-token-2' });
    expect(onResolved).not.toHaveBeenCalled();
  });

  it('hands a submit failure to onFailed instead of offering a retry', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    const onResolved = vi.fn();
    const onFailed = vi.fn();
    const invalid = new ClerkAPIResponseError('invalid', {
      status: 422,
      data: [{ code: 'form_param_invalid', message: 'invalid' } as any],
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockRejectedValue(invalid);

    render(
      <ProtectCheckModal
        resource={fixtures.signIn}
        onResolved={onResolved}
        onFailed={onFailed}
      />,
      { wrapper },
    );

    await waitFor(() => expect(onFailed).toHaveBeenCalledWith(invalid));
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it('hands the timed-out error to onFailed when the challenge is expired and a reload keeps it expired', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck({ expiresAt: Date.now() - 1000 });
    });
    const onResolved = vi.fn();
    const onFailed = vi.fn();
    const reloadMock = vi.fn().mockResolvedValue(fixtures.signIn);
    (fixtures.signIn as any).reload = reloadMock;

    render(
      <ProtectCheckModal
        resource={fixtures.signIn}
        onResolved={onResolved}
        onFailed={onFailed}
      />,
      { wrapper },
    );

    await waitFor(() =>
      expect(onFailed).toHaveBeenCalledWith(expect.objectContaining({ code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT })),
    );
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it('uses the sign-up localization keys for a sign-up gate', async () => {
    const { wrapper: Wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    mockExecute.mockReturnValue(new Promise(() => {}));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Wrapper>
        <OptionsProvider
          value={{
            localization: {
              signIn: { protectCheck: { title: 'Sign-in check' } },
              signUp: { protectCheck: { title: 'Sign-up check' } },
            },
          }}
        >
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    render(
      <ProtectCheckModal
        resource={fixtures.signUp}
        onResolved={vi.fn()}
        onFailed={vi.fn()}
      />,
      { wrapper },
    );

    screen.getByText('Sign-up check');
    expect(screen.queryByText('Sign-in check')).toBeNull();
    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));
  });
});
