import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignInProtectCheck } from '../SignInProtectCheck';

vi.mock('@clerk/shared/internal/clerk-js/protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';

const { createFixtures } = bindCreateFixtures('SignIn');

const mockExecute = executeProtectCheck as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockExecute.mockReset();
});

describe('SignInProtectCheck', () => {
  it('renders verification UI', async () => {
    const { wrapper } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    mockExecute.mockReturnValue(new Promise(() => {})); // never resolves

    const { findByText } = render(<SignInProtectCheck />, { wrapper });

    expect(await findByText(/verifying your request/i)).toBeInTheDocument();
  });

  it('runs the SDK challenge and submits the proof token, then routes by status', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck({ sdkUrl: 'https://protect.example.com/v1.js' });
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'needs_first_factor',
      protectCheck: null,
      createdSessionId: null,
    } as unknown as SignInResource);

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          sdkUrl: 'https://protect.example.com/v1.js',
          token: 'challenge-token',
        }),
        expect.any(HTMLDivElement),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-one');
    });
  });

  it('routes to factor-two when status becomes needs_second_factor', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'needs_second_factor',
      protectCheck: null,
      createdSessionId: null,
    } as unknown as SignInResource);

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two'));
  });

  it('finalizes the session when status becomes complete', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'complete',
      protectCheck: null,
      createdSessionId: 'sess_123',
    } as unknown as SignInResource);

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalled());
  });

  it('reloads the resource (does not run SDK) when expiresAt is in the past', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck({ expiresAt: Date.now() - 60_000 });
    });
    const reloadMock = vi.fn().mockResolvedValue(fixtures.signIn);
    (fixtures.signIn as any).reload = reloadMock;

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(mockExecute).not.toHaveBeenCalled();
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it('treats protect_check_already_resolved as a soft success, reloads, and continues the flow', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signIn.submitProtectCheck.mockRejectedValue(
      new ClerkAPIResponseError('Already resolved', {
        data: [{ code: 'protect_check_already_resolved', message: 'Already resolved', long_message: '' }],
        status: 400,
        clerkTraceId: 'trace_123',
      }),
    );
    const reloadMock = vi.fn().mockResolvedValue(fixtures.signIn);
    (fixtures.signIn as any).reload = reloadMock;

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(fixtures.signIn.submitProtectCheck).toHaveBeenCalled();
      // Spec §5.3.4: reload to refresh stale local state before re-routing
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it('self-navigates on a chained challenge', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-1');
    fixtures.signIn.submitProtectCheck.mockResolvedValue({
      status: 'needs_protect_check',
      protectCheck: {
        status: 'pending',
        token: 'challenge-token-2',
        sdkUrl: 'https://protect.example.com/sdk.js',
      },
      createdSessionId: null,
    } as unknown as SignInResource);

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('.'));
  });

  it('aborts the SDK signal and does not submit when unmounted mid-challenge', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    let capturedSignal: AbortSignal | undefined;
    let resolveProof: (token: string) => void;
    mockExecute.mockImplementation((_protectCheck, _container, opts) => {
      capturedSignal = opts?.signal;
      return new Promise<string>(resolve => {
        resolveProof = resolve;
      });
    });

    const { unmount } = render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);

    // Even if the script later resolves (uncooperative SDK), submit must not fire
    resolveProof!('late-proof');
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(fixtures.signIn.submitProtectCheck).not.toHaveBeenCalled();
  });

  it('does not submit a proof token when the SDK challenge fails to execute', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignInWithProtectCheck();
    });
    // executeProtectCheck always wraps load failures in ClerkRuntimeError; mirror that here
    // so handleError's known-error check passes and the rejection is fully consumed.
    mockExecute.mockRejectedValue(
      new ClerkRuntimeError('Protect check script failed to load', {
        code: 'protect_check_script_load_failed',
      }),
    );

    render(<SignInProtectCheck />, { wrapper });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(fixtures.signIn.submitProtectCheck).not.toHaveBeenCalled();
  });
});
