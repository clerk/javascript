import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignUpProtectCheck } from '../SignUpProtectCheck';

vi.mock('@clerk/shared/internal/clerk-js/protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';

const { createFixtures } = bindCreateFixtures('SignUp');

const mockExecute = executeProtectCheck as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockExecute.mockReset();
});

describe('SignUpProtectCheck', () => {
  it('renders verification UI', async () => {
    const { wrapper } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    mockExecute.mockReturnValue(new Promise(() => {})); // never resolves; keeps spinner

    const { findByText } = render(<SignUpProtectCheck />, { wrapper });

    expect(await findByText(/verifying your request/i)).toBeInTheDocument();
  });

  it('runs the SDK challenge with the URL and resource and submits the proof token', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck({ sdkUrl: 'https://protect.example.com/v1.js' });
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signUp.submitProtectCheck.mockResolvedValue({
      status: 'complete',
      protectCheck: null,
      createdSessionId: 'sess_123',
    } as unknown as SignUpResource);

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          sdkUrl: 'https://protect.example.com/v1.js',
          token: 'challenge-token',
        }),
        expect.any(HTMLDivElement),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(fixtures.signUp.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    });
  });

  it('reloads the resource (does not run SDK) when expiresAt is in the past', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck({ expiresAt: Date.now() - 60_000 });
    });
    const reloadMock = vi.fn().mockResolvedValue(fixtures.signUp);
    (fixtures.signUp as any).reload = reloadMock;

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(mockExecute).not.toHaveBeenCalled();
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it('treats protect_check_already_resolved as a soft success, reloads, and continues the flow', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-abc');
    fixtures.signUp.submitProtectCheck.mockRejectedValue(
      new ClerkAPIResponseError('Already resolved', {
        data: [{ code: 'protect_check_already_resolved', message: 'Already resolved', long_message: '' }],
        status: 400,
        clerkTraceId: 'trace_123',
      }),
    );
    const reloadMock = vi.fn().mockResolvedValue(fixtures.signUp);
    (fixtures.signUp as any).reload = reloadMock;

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(fixtures.signUp.submitProtectCheck).toHaveBeenCalled();
      // Spec §5.3.4: reload to refresh stale local state before re-routing
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it('re-runs on a chained challenge (self-navigates)', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    mockExecute.mockResolvedValue('proof-1');
    // Submit returns a sign-up that still has protectCheck set (chained)
    fixtures.signUp.submitProtectCheck.mockResolvedValue({
      status: 'missing_requirements',
      missingFields: ['protect_check'],
      protectCheck: {
        status: 'pending',
        token: 'challenge-token-2',
        sdkUrl: 'https://protect.example.com/sdk.js',
      },
    } as unknown as SignUpResource);

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => {
      // Self-navigates to '.' to re-render with the new challenge
      expect(fixtures.router.navigate).toHaveBeenCalledWith('.', { searchParams: expect.any(URLSearchParams) });
    });
  });

  it('aborts the SDK signal and does not submit when unmounted mid-challenge', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    let capturedSignal: AbortSignal | undefined;
    let resolveProof: (token: string) => void;
    mockExecute.mockImplementation((_protectCheck, _container, opts) => {
      capturedSignal = opts?.signal;
      return new Promise<string>(resolve => {
        resolveProof = resolve;
      });
    });

    const { unmount } = render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);

    // Even if the script later resolves (uncooperative SDK), submit must not fire
    resolveProof!('late-proof');
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(fixtures.signUp.submitProtectCheck).not.toHaveBeenCalled();
  });

  it('does not submit a proof token when the SDK challenge fails to execute', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    // executeProtectCheck always wraps load failures in ClerkRuntimeError; mirror that here
    // so handleError's known-error check passes and the rejection is fully consumed.
    mockExecute.mockRejectedValue(
      new ClerkRuntimeError('Protect check script failed to load', {
        code: 'protect_check_script_load_failed',
      }),
    );

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(fixtures.signUp.submitProtectCheck).not.toHaveBeenCalled();
  });
});
