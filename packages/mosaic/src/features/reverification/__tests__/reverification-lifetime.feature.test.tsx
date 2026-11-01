import { reverificationError } from '@clerk/shared/authorization-errors';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Reverification, useReverificationFlow } from '../reverification';
import type { ReverificationState } from '../reverification.types';
import { useReverificationWithState } from '../use-reverification-with-state';

function Host({ action, report }: { action: () => Promise<unknown>; report: (outcome: unknown) => void }) {
  const [run, controller] = useReverificationFlow(action);
  return (
    <>
      <button
        type='button'
        onClick={() => void run().then(report, report)}
      >
        Run
      </button>
      <button
        type='button'
        onClick={() => {
          controller.onCancel?.();
          void run().then(report, report);
        }}
      >
        Restart
      </button>
      {controller.visible ? <Reverification controller={controller} /> : null}
      {controller.onCancel ? (
        <button
          type='button'
          onClick={controller.onCancel}
        >
          Cancel
        </button>
      ) : null}
    </>
  );
}

function CallbackHost({
  action,
  report,
  capture,
}: {
  action: () => Promise<unknown>;
  report: (outcome: unknown) => void;
  capture: (state: Extract<ReverificationState, { phase: 'active' }>) => void;
}) {
  const [run, state] = useReverificationWithState(action);
  useEffect(() => {
    if (state.phase === 'active') {
      capture(state);
    }
  }, [state, capture]);
  return (
    <button
      type='button'
      onClick={() => void run().then(report, report)}
    >
      Run callback action
    </button>
  );
}

async function setup(action: () => Promise<unknown>) {
  const fapi = serveFapi({
    client: fapiClient([
      fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) }),
      fapiSession({ id: 'sess_2', user: fapiUser({ id: 'user_2' }) }),
    ]),
    verification: { firstFactors: [{ strategy: 'password' }], secrets: { password: 'hunter2' } },
  });
  const report = vi.fn();
  const rendered = await renderWithClerk(
    <Host
      action={action}
      report={report}
    />,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Run' }));
  return { ...rendered, user, report, fapi };
}

describe('reverification run identity', () => {
  it('frees the slot before an old hint arrives and leaves the new challenge intact', async () => {
    const oldResponse = deferred<unknown>();
    const action = vi
      .fn()
      .mockImplementationOnce(() => oldResponse.promise)
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    const { clerk, user, report } = await setup(action);
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ code: 'reverification_cancelled' })),
    );
    await user.click(screen.getByRole('button', { name: 'Run' }));
    const password = await screen.findByLabelText('Password');
    await user.type(password, 'hun');
    oldResponse.resolve(reverificationError());
    await act(tick);
    expect(password).toHaveValue('hun');
    expect(report).toHaveBeenCalledTimes(1);
    await user.type(password, 'ter2{Enter}');
    await waitFor(() => expect(report).toHaveBeenCalledWith({ done: true }));
    expect(action).toHaveBeenCalledTimes(3);
    expect(clerk.session?.id).toBe('sess_2');
  });

  it('ignores a successful old attempt while the new account has a challenge open', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    const { clerk, user, report, fapi } = await setup(action);
    const attempt = holdRequests('post', '/v1/client/sessions/sess_1/verify/attempt_first_factor');
    await user.type(await screen.findByLabelText('Password'), 'hunter2{Enter}');
    await waitFor(() => expect(attempt.requests).toHaveLength(1));
    await act(() => clerk.setActive({ session: 'sess_2' }));
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ code: 'reverification_cancelled' })),
    );
    await user.click(screen.getByRole('button', { name: 'Run' }));
    const password = await screen.findByLabelText('Password');
    await user.type(password, 'hun');
    attempt.release();
    await waitFor(() => expect(fapi.verification.status).toBe('complete'));
    await act(tick);
    expect(clerk.session?.id).toBe('sess_2');
    expect(password).toHaveValue('hun');
    expect(action).toHaveBeenCalledTimes(2);
    expect(password).toBeEnabled();
    expect(report).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('resets the challenge when cancellation and a fresh run are batched', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    const { user, report } = await setup(action);
    await user.type(await screen.findByLabelText('Password'), 'old value');
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue(''));
    await user.type(screen.getByLabelText('Password'), 'hunter2{Enter}');
    await waitFor(() => expect(report).toHaveBeenCalledWith({ done: true }));
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('ignores retained completion and cancellation callbacks from a previous run', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]) });
    const challenges: Extract<ReverificationState, { phase: 'active' }>[] = [];
    const capture = (state: Extract<ReverificationState, { phase: 'active' }>) => {
      challenges.push(state);
    };
    const report = vi.fn();
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    await renderWithClerk(
      <CallbackHost
        action={action}
        report={report}
        capture={capture}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run callback action' }));
    await waitFor(() => expect(challenges).toHaveLength(1));
    const first = challenges[0];
    if (!first) {
      throw new Error('Expected the first challenge');
    }
    act(() => {
      first.cancel();
      fireEvent.click(screen.getByRole('button', { name: 'Run callback action' }));
    });
    await waitFor(() => expect(challenges).toHaveLength(2));
    const second = challenges[1];
    if (!second) {
      throw new Error('Expected the second challenge');
    }
    act(() => {
      first.complete();
      first.cancel();
    });
    await act(tick);
    expect(action).toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenCalledTimes(1);
    act(() => second.complete());
    await waitFor(() => expect(report).toHaveBeenCalledWith({ done: true }));
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('keeps a run cancelled after switching away and back within one React update', async () => {
    const response = deferred<unknown>();
    const action = vi.fn(() => response.promise);
    const { clerk, report } = await setup(action);
    await act(async () => {
      await clerk.setActive({ session: 'sess_2' });
      await clerk.setActive({ session: 'sess_1' });
    });
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ code: 'reverification_cancelled' })),
    );
    response.resolve(reverificationError());
    await act(tick);
    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(action).toHaveBeenCalledOnce();
  });

  it('rejects on signout before the initial request finishes', async () => {
    const response = deferred<unknown>();
    const { clerk, report } = await setup(() => response.promise);
    await act(() => clerk.signOut());
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ code: 'reverification_cancelled' })),
    );
    response.resolve({ done: true });
    await act(tick);
    expect(report).toHaveBeenCalledTimes(1);
  });

  it('rejects on unmount before the initial request finishes', async () => {
    const response = deferred<unknown>();
    const { unmount, report } = await setup(() => response.promise);
    unmount();
    await waitFor(() =>
      expect(report).toHaveBeenCalledWith(expect.objectContaining({ code: 'reverification_cancelled' })),
    );
    response.resolve({ done: true });
    await act(tick);
    expect(report).toHaveBeenCalledTimes(1);
  });
});
