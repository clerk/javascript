import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render } from '@/test/utils';

import { SignUp } from '../index';
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

  it('keeps the standalone protect-check route mounted after protectCheck clears', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    fixtures.router.currentPath = '/sign-up/protect-check';
    fixtures.router.fullPath = '/sign-up';
    fixtures.router.indexPath = '/sign-up';
    fixtures.router.matches.mockImplementation((path?: string) => path === 'protect-check');
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { findByText, queryByText, rerender } = render(<SignUp />, { wrapper });

    expect(await findByText(/verifying your request/i)).toBeInTheDocument();

    (fixtures.signUp as any).protectCheck = null;
    (fixtures.signUp as any).missingFields = [];
    rerender(<SignUp />);

    expect(queryByText(/verifying your request/i)).toBeInTheDocument();
    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('/sign-up');
  });

  it('routes stale standalone protect-check visits back to the flow start', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithEmailAddress();
    });
    fixtures.router.currentPath = '/sign-up/protect-check';
    fixtures.router.fullPath = '/sign-up';
    fixtures.router.indexPath = '/sign-up';

    const { queryByText } = render(<SignUpProtectCheck />, { wrapper });

    // The card shell must not flash while the redirect below kicks in.
    expect(queryByText(/verifying your request/i)).not.toBeInTheDocument();

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('/sign-up'));
    expect(mockExecute).not.toHaveBeenCalled();
    expect(queryByText(/verifying your request/i)).not.toBeInTheDocument();
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
      // reload to refresh stale local state before re-routing
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

  it('finalizes the session when an already_resolved reload reveals a complete status', async () => {
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
    const reloadMock = vi.fn().mockImplementation(async () => {
      (fixtures.signUp as any).status = 'complete';
      (fixtures.signUp as any).createdSessionId = 'sess_done';
      (fixtures.signUp as any).protectCheck = null;
      (fixtures.signUp as any).missingFields = [];
      return fixtures.signUp;
    });
    (fixtures.signUp as any).reload = reloadMock;

    render(<SignUpProtectCheck />, { wrapper });

    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalled();
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
    });
  });

  describe('challenge widget visibility', () => {
    // The remote SDK never tells the host when it paints a widget — visibility is inferred from
    // the container's rendered height, reported through a ResizeObserver. This controllable mock
    // replaces the no-op stub from vitest.setup so tests can fire the size-change callbacks.
    class MockResizeObserver {
      static instances: MockResizeObserver[] = [];
      observed: Element[] = [];
      constructor(private readonly callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      unobserve() {}
      disconnect() {}
      static triggerFor(el: Element) {
        for (const instance of MockResizeObserver.instances) {
          if (instance.observed.includes(el)) {
            instance.callback([], instance as unknown as ResizeObserver);
          }
        }
      }
    }

    const originalResizeObserver = window.ResizeObserver;

    beforeEach(() => {
      MockResizeObserver.instances = [];
      window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      window.ResizeObserver = originalResizeObserver;
    });

    const renderWithPendingChallenge = async () => {
      const { wrapper } = await createFixtures(f => {
        f.startSignUpWithProtectCheck();
      });
      let container: HTMLDivElement | undefined;
      mockExecute.mockImplementation((_protectCheck, el) => {
        container = el as HTMLDivElement;
        return new Promise(() => {}); // never resolves; the check stays running
      });
      const utils = render(<SignUpProtectCheck />, { wrapper });
      await waitFor(() => expect(mockExecute).toHaveBeenCalled());
      return { ...utils, container: container! };
    };

    const setRenderedHeight = (el: HTMLElement, height: number) => {
      Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true });
      act(() => MockResizeObserver.triggerFor(el));
    };

    it('hides the spinner while the challenge widget is visible and restores it when the widget collapses', async () => {
      const { container, queryByText, findByText } = await renderWithPendingChallenge();

      // Invisible phase (SDK loading / executing): the spinner is the progress indicator.
      expect(await findByText(/loading/i)).toBeInTheDocument();

      // The SDK paints a visible widget (e.g. Turnstile) into the container — the widget owns
      // the UI now, so the spinner must not keep spinning below it.
      setRenderedHeight(container, 65);
      expect(queryByText(/loading/i)).not.toBeInTheDocument();

      // The widget collapses again while the check is still running (e.g. solved, proof
      // verification in flight) — the spinner takes back over.
      setRenderedHeight(container, 0);
      expect(await findByText(/loading/i)).toBeInTheDocument();
    });

    it('keeps the empty challenge container out of the layout until the widget renders', async () => {
      const { container } = await renderWithPendingChallenge();

      // No reserved height and no flex-gap slot while there is nothing to show.
      expect(container.style.minHeight).toBe('');
      expect(container.style.position).toBe('absolute');

      setRenderedHeight(container, 65);
      expect(container.style.position).toBe('static');
    });
  });

  it('shows a retry control after a failure and re-runs the challenge when clicked', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.startSignUpWithProtectCheck();
    });
    mockExecute
      .mockRejectedValueOnce(
        new ClerkRuntimeError('Protect check script failed to load', { code: 'protect_check_script_load_failed' }),
      )
      .mockResolvedValue('proof-retry');
    fixtures.signUp.submitProtectCheck.mockResolvedValue({
      status: 'complete',
      protectCheck: null,
      createdSessionId: 'sess_123',
    } as unknown as SignUpResource);

    const { findByRole } = render(<SignUpProtectCheck />, { wrapper });

    // Target the button by role: the error message itself also contains "try again".
    const retryButton = await findByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(2);
      expect(fixtures.signUp.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-retry' });
    });
  });
});
