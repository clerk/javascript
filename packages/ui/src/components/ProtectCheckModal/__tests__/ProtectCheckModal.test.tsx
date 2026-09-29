import { ClerkAPIResponseError } from '@clerk/shared/error';
import { waitFor } from '@testing-library/react';
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
  it('calls onResolved once the gate clears', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    const onResolved = vi.fn();
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockImplementation(() => {
      (fixtures.signIn as any).protectCheck = null;
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

    await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
    expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
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

  it('keeps the modal open with a retry when the submit fails for a reason other than a block', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    const onResolved = vi.fn();
    const onFailed = vi.fn();
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockRejectedValue(
      new ClerkAPIResponseError('invalid', {
        status: 422,
        data: [{ code: 'form_param_invalid', message: 'invalid' } as any],
      }),
    );

    render(
      <ProtectCheckModal
        resource={fixtures.signIn}
        onResolved={onResolved}
        onFailed={onFailed}
      />,
      { wrapper },
    );

    await screen.findByRole('button', { name: /try again/i });
    expect(onFailed).not.toHaveBeenCalled();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it('hands a blocked verdict to onFailed instead of resolving', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    const blocked = new ClerkAPIResponseError('blocked', {
      status: 403,
      data: [{ code: 'action_blocked', message: 'blocked', meta: { traceId: 'trace_1' } } as any],
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockRejectedValue(blocked);
    const onResolved = vi.fn();
    const onFailed = vi.fn();

    render(
      <ProtectCheckModal
        resource={fixtures.signIn}
        onResolved={onResolved}
        onFailed={onFailed}
      />,
      { wrapper },
    );

    await waitFor(() => expect(onFailed).toHaveBeenCalledWith(blocked));
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
