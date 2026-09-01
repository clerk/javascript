import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import { deferred, tick } from '../../../machines/__tests__/test-utils';
import {
  reverificationMachine,
  useReverificationController,
  type ReverificationDeps,
} from '../reverification.controller';
import type { ReverificationModel, ReverificationReadyModel } from '../reverification.model';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';

const password: ReverificationMethod = { id: 'password', strategy: 'password' };
const email: ReverificationMethod = {
  id: 'email_code:idn_1',
  strategy: 'email_code',
  identifier: 'a***@ex.com',
  emailAddressId: 'idn_1',
};
const totp: ReverificationMethod = { id: 'totp', strategy: 'totp' };

function firstFactorResult(overrides: Partial<ReverificationResult> = {}): ReverificationResult {
  return {
    status: 'needs_first_factor',
    methods: [password, email],
    startingMethod: password,
    ...overrides,
  };
}

function seatedDeps(overrides: Partial<ReverificationDeps> = {}): ReverificationDeps {
  return {
    start: vi.fn(async () => firstFactorResult()),
    prepare: vi.fn(async () => {}),
    attempt: vi.fn(async () => firstFactorResult({ status: 'complete' })),
    verifyPasskey: vi.fn(async () => firstFactorResult({ status: 'complete' })),
    finish: vi.fn(async () => {}),
    cancel: vi.fn(),
    ...overrides,
  };
}

function startActor(deps: ReverificationDeps = seatedDeps()) {
  const actor = createActor(reverificationMachine, { context: { deps } }).start();
  actor.send({ type: 'START' });
  return actor;
}

function readyModel(overrides: Partial<ReverificationReadyModel> = {}): ReverificationReadyModel {
  return {
    status: 'ready',
    isActive: true,
    supportEmail: 'support@example.com',
    start: vi.fn(async () => firstFactorResult()),
    prepare: vi.fn(async () => {}),
    attempt: vi.fn(async () => firstFactorResult({ status: 'complete' })),
    verifyPasskey: vi.fn(async () => firstFactorResult({ status: 'complete' })),
    finish: vi.fn(async () => {}),
    cancel: vi.fn(),
    ...overrides,
  };
}

describe('reverificationMachine', () => {
  it('starts verification and lands on the starting method', async () => {
    const actor = startActor();
    expect(actor.getSnapshot().value).toBe('starting');
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('password');
  });

  it('returns to verifying with the error when an attempt fails', async () => {
    const actor = startActor(
      seatedDeps({ attempt: vi.fn(async () => Promise.reject(new Error('That password is incorrect.'))) }),
    );
    await tick();
    actor.send({ type: 'TYPE', value: 'bad' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.errorMessage).toBe('That password is incorrect.');
  });

  it('prepares an email code once when that method is selected', async () => {
    const prepare = vi.fn(async () => {});
    const actor = startActor(seatedDeps({ prepare }));
    await tick();
    actor.send({ type: 'SHOW_METHODS' });
    expect(actor.getSnapshot().value).toBe('methodPicker');
    actor.send({ type: 'SELECT_METHOD', id: email.id });
    expect(actor.getSnapshot().value).toBe('preparing');
    await tick();
    expect(prepare).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('email_code');

    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(prepare).toHaveBeenCalledOnce();
  });

  it('routes to second factor after a successful first-factor attempt', async () => {
    const actor = startActor(
      seatedDeps({
        attempt: vi.fn(async () =>
          firstFactorResult({
            status: 'needs_second_factor',
            methods: [totp],
            startingMethod: totp,
          }),
        ),
      }),
    );
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('totp');
  });

  it('opens help from the method picker and returns to it', async () => {
    const actor = startActor();
    await tick();
    actor.send({ type: 'SHOW_METHODS' });
    actor.send({ type: 'SHOW_HELP' });
    expect(actor.getSnapshot().value).toBe('help');
    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('methodPicker');
  });

  it('does not leave submitting when abort is requested until the attempt settles', async () => {
    const attempt = deferred<ReverificationResult>();
    const cancel = vi.fn();
    const actor = startActor(seatedDeps({ attempt: () => attempt.promise, cancel }));
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('submitting');

    actor.send({ type: 'ABORT' });
    expect(actor.getSnapshot().value).toBe('submitting');
    expect(cancel).not.toHaveBeenCalled();

    attempt.reject(new Error('cancelled'));
    await tick();
    expect(actor.getSnapshot().value).toBe('done');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('finishes on success without replacing the active method', async () => {
    const finish = deferred<void>();
    const actor = startActor(
      seatedDeps({
        attempt: vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null })),
        finish: () => finish.promise,
      }),
    );
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('completing');
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('password');
    finish.resolve();
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('done'));
  });
});

describe('useReverificationController', () => {
  it('is idle when reverification is not active', () => {
    const { result } = renderHook(() =>
      useReverificationController(readyModel({ isActive: false })),
    );
    expect(result.current.status).toBe('idle');
  });

  it('is loading while the model is still waiting on Clerk', () => {
    const loading: ReverificationModel = {
      status: 'loading',
      isActive: true,
    };
    const { result } = renderHook(() => useReverificationController(loading));
    expect(result.current.status).toBe('loading');
  });

  it('is unavailable when start fails', async () => {
    const { result } = renderHook(() =>
      useReverificationController(readyModel({ start: vi.fn(async () => Promise.reject(new Error('no session'))) })),
    );
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
  });

  it('is unavailable when start returns no methods', async () => {
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [], startingMethod: null })),
        }),
      ),
    );
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
  });

  it('omits onShowMethods when only one method is available', async () => {
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [password], startingMethod: password })),
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    if (result.current.status !== 'ready') {
      throw new Error('expected ready');
    }
    expect(result.current.onShowMethods).toBeUndefined();
    expect(result.current.step).toBe('password');
  });

  it('marks the current step pending while an attempt is in flight', async () => {
    const attempt = deferred<ReverificationResult>();
    const { result } = renderHook(() =>
      useReverificationController(readyModel({ attempt: () => attempt.promise })),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onValueChange('secret');
        result.current.onSubmit();
      }
    });

    await waitFor(() => {
      if (result.current.status === 'ready') {
        expect(result.current.isPending).toBe(true);
      }
    });

    act(() => {
      attempt.resolve(firstFactorResult({ status: 'complete', methods: [], startingMethod: null }));
    });
  });

  it('stays on the current step pending while finish runs', async () => {
    const finish = deferred<void>();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          attempt: vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null })),
          finish: () => finish.promise,
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onValueChange('secret');
        result.current.onSubmit();
      }
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status === 'ready') {
        expect(result.current.step).toBe('password');
        expect(result.current.isPending).toBe(true);
      }
    });

    act(() => {
      finish.resolve();
    });
    await waitFor(() => expect(result.current.status).toBe('loading'));
  });

  it('keeps the current step when the model flickers to loading', async () => {
    const start = vi.fn(async () => firstFactorResult());
    const { result, rerender } = renderHook(
      ({ model }: { model: ReverificationModel }) => useReverificationController(model),
      { initialProps: { model: readyModel({ start }) } },
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(start).toHaveBeenCalledOnce();

    rerender({ model: { status: 'loading', isActive: true } });
    expect(result.current.status).toBe('ready');
    if (result.current.status === 'ready') {
      expect(result.current.step).toBe('password');
    }
    expect(start).toHaveBeenCalledOnce();
  });

  it('keeps finish seated when the model flickers to loading', async () => {
    const finish = deferred<void>();
    const finishFn = vi.fn(() => finish.promise);
    const { result, rerender } = renderHook(
      ({ model }: { model: ReverificationModel }) => useReverificationController(model),
      {
        initialProps: {
          model: readyModel({
            attempt: vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null })),
            finish: finishFn,
          }),
        },
      },
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onValueChange('secret');
        result.current.onSubmit();
      }
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status === 'ready') {
        expect(result.current.isPending).toBe(true);
      }
    });

    rerender({ model: { status: 'loading', isActive: true } });
    expect(result.current.status).toBe('ready');
    if (result.current.status === 'ready') {
      expect(result.current.step).toBe('password');
      expect(result.current.isPending).toBe(true);
    }

    act(() => {
      finish.resolve();
    });
    await waitFor(() => expect(result.current.status).toBe('loading'));
    expect(finishFn).toHaveBeenCalledOnce();
  });

  it('starts again only when the handshake ends and reopens', async () => {
    const start = vi.fn(async () => firstFactorResult());
    const { result, rerender } = renderHook(
      ({ model }: { model: ReverificationModel }) => useReverificationController(model),
      { initialProps: { model: readyModel({ start }) } },
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    rerender({ model: readyModel({ start, isActive: false }) });
    expect(result.current.status).toBe('idle');

    rerender({ model: readyModel({ start, isActive: true }) });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(start).toHaveBeenCalledTimes(2);
  });
});
