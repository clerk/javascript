import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import type {
  ProtectCheckChallenge,
  ProtectCheckRunnerParams,
} from '@/ui/components/ProtectCheck/protect-check-runner.types';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useProtectCheckRunner } from '../useProtectCheckRunner';

vi.mock('@clerk/shared/internal/clerk-js/protectCheck', () => ({ executeProtectCheck: vi.fn() }));

const { createFixtures } = bindCreateFixtures('SignIn');

function Runner({ operations }: { operations: ProtectCheckRunnerParams }) {
  const runner = useProtectCheckRunner(operations, { loadTimeoutMs: undefined });
  return (
    <>
      <div ref={runner.containerRef} />
      <span>{runner.isRunning ? 'Running' : 'Idle'}</span>
      {runner.error && <p>{runner.error}</p>}
      <button
        type='button'
        onClick={runner.retry}
      >
        Retry
      </button>
    </>
  );
}

const challenge: ProtectCheckChallenge = {
  status: 'pending',
  token: 'challenge-token',
  sdkUrl: 'https://protect.example.com/sdk.js',
};

describe('Protect-check command lifecycle', () => {
  it('runs the completion returned by proof submission', async () => {
    const { wrapper } = await createFixtures();
    vi.mocked(executeProtectCheck).mockResolvedValue('proof-token');
    const complete = vi.fn().mockResolvedValue(undefined);
    const currentCompletion = vi.fn().mockResolvedValue(undefined);
    const submitProof = vi.fn().mockResolvedValue(complete);
    const operations: ProtectCheckRunnerParams = {
      getProtectCheck: () => challenge,
      getCompletion: () => currentCompletion,
      reload: () => Promise.resolve(),
      submitProof,
    };
    const { getByText } = render(
      <CardStateProvider>
        <Runner operations={operations} />
      </CardStateProvider>,
      { wrapper },
    );

    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(submitProof).toHaveBeenCalledExactlyOnceWith('proof-token');
    expect(complete.mock.calls[0][0]()).toBe(false);
    expect(currentCompletion).not.toHaveBeenCalled();
    await waitFor(() => expect(getByText('Idle')).toBeInTheDocument());
  });

  it('retries completion without executing the cleared challenge again', async () => {
    const { wrapper } = await createFixtures();
    vi.mocked(executeProtectCheck).mockReset().mockResolvedValue('proof-token');
    let currentChallenge: ProtectCheckChallenge | null = challenge;
    const failedCompletion = vi.fn().mockRejectedValue(new Error('Continuation unavailable'));
    const retryCompletion = vi.fn().mockResolvedValue(undefined);
    const operations: ProtectCheckRunnerParams = {
      getProtectCheck: () => currentChallenge,
      getCompletion: () => retryCompletion,
      reload: () => Promise.resolve(),
      submitProof: () => {
        currentChallenge = null;
        return Promise.resolve(failedCompletion);
      },
    };
    const { getByRole, findByText, getByText, userEvent } = render(
      <CardStateProvider>
        <Runner operations={operations} />
      </CardStateProvider>,
      { wrapper },
    );

    await findByText(/Unable to complete action/);
    await userEvent.click(getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(retryCompletion).toHaveBeenCalledOnce());
    expect(vi.mocked(executeProtectCheck)).toHaveBeenCalledOnce();
    expect(retryCompletion.mock.calls[0][0]()).toBe(false);
    await waitFor(() => expect(getByText('Idle')).toBeInTheDocument());
  });
});
