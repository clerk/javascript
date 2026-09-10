import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../../machine/createActor';
import { deferred, tick } from '../../../machines/__tests__/test-utils';
import {
  type ReverificationDeps,
  reverificationMachine,
  useReverificationController,
} from '../reverification.controller';
import type { ReverificationModel, ReverificationReadyModel } from '../reverification.model';
import type { ReverificationMethod, ReverificationResult } from '../reverification.types';

const password: ReverificationMethod = { id: 'password', stage: 'first', strategy: 'password' };
const email: ReverificationMethod = {
  id: 'email_code:idn_1',
  stage: 'first',
  strategy: 'email_code',
  identifier: 'a***@ex.com',
  emailAddressId: 'idn_1',
};
const totp: ReverificationMethod = { id: 'totp', stage: 'second', strategy: 'totp' };

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
    expect(actor.getSnapshot().value).toBe('methodPickerPreparing');
    await tick();
    expect(prepare).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('email_code');
    expect(actor.getSnapshot().context.resendAvailableAt).toEqual(expect.any(Number));

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

  it('does not leave submitting when reset until the attempt settles', async () => {
    const attempt = deferred<ReverificationResult>();
    const cancel = vi.fn();
    const actor = startActor(seatedDeps({ attempt: () => attempt.promise, cancel }));
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('submitting');

    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('submitting');
    expect(cancel).not.toHaveBeenCalled();

    attempt.reject(new Error('cancelled'));
    await tick();
    expect(actor.getSnapshot().value).toBe('done');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('cancels a successful attempt that settled after reset', async () => {
    const attempt = deferred<ReverificationResult>();
    const finish = vi.fn(async () => {});
    const cancel = vi.fn();
    const actor = startActor(seatedDeps({ attempt: () => attempt.promise, finish, cancel }));
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    actor.send({ type: 'RESET' });

    attempt.resolve(firstFactorResult({ status: 'complete', methods: [], startingMethod: null }));
    await tick();
    expect(actor.getSnapshot().value).toBe('done');
    expect(cancel).toHaveBeenCalledOnce();
    expect(finish).not.toHaveBeenCalled();
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

  it('returns to the current method with the error when finish fails', async () => {
    const actor = startActor(
      seatedDeps({
        attempt: vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null })),
        finish: vi.fn(async () => Promise.reject(new Error('Session could not be activated.'))),
      }),
    );
    await tick();
    actor.send({ type: 'TYPE', value: 'secret' });
    actor.send({ type: 'SUBMIT' });
    await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));
    expect(actor.getSnapshot().context.activeMethod?.strategy).toBe('password');
    expect(actor.getSnapshot().context.errorMessage).toBe('Session could not be activated.');
    expect(actor.getSnapshot().context.deps.cancel).not.toHaveBeenCalled();
  });

  it('prepares the starting email method without leaving the factor', async () => {
    const prepare = deferred<void>();
    const actor = startActor(
      seatedDeps({
        start: vi.fn(async () => firstFactorResult({ methods: [email], startingMethod: email })),
        prepare: () => prepare.promise,
      }),
    );
    await tick();
    expect(actor.getSnapshot().value).toBe('preparing');
    expect(actor.getSnapshot().context.resendAvailableAt).toEqual(expect.any(Number));

    actor.send({ type: 'TYPE', value: '123456' });
    expect(actor.getSnapshot().context.inputValue).toBe('123456');

    prepare.resolve();
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.resendAvailableAt).toEqual(expect.any(Number));
  });

  it('queues an attempt submitted while the starting prepare is in flight', async () => {
    const prepare = deferred<void>();
    const finish = deferred<void>();
    const attempt = vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null }));
    const actor = startActor(
      seatedDeps({
        start: vi.fn(async () => firstFactorResult({ methods: [email], startingMethod: email })),
        prepare: () => prepare.promise,
        attempt,
        finish: () => finish.promise,
      }),
    );
    await tick();
    actor.send({ type: 'TYPE', value: '123456' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('preparing');
    expect(attempt).not.toHaveBeenCalled();

    prepare.resolve();
    await tick();
    expect(attempt).toHaveBeenCalledOnce();
    expect(actor.getSnapshot().value).toBe('completing');
  });

  it('keeps the factor interactive and queues submit while resend prepares', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    const resend = deferred<void>();
    let prepareCount = 0;
    const prepare = vi.fn(() => {
      prepareCount += 1;
      return prepareCount === 1 ? Promise.resolve() : resend.promise;
    });
    const attempt = vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null }));

    try {
      const actor = startActor(
        seatedDeps({
          start: vi.fn(async () => firstFactorResult({ methods: [email], startingMethod: email })),
          prepare,
          attempt,
        }),
      );
      await vi.waitFor(() => expect(actor.getSnapshot().value).toBe('verifying'));

      actor.send({ type: 'SHOW_HELP' });
      actor.send({ type: 'BACK' });
      now.mockReturnValue(31_000);
      actor.send({ type: 'RESEND' });

      expect(actor.getSnapshot().value).toBe('preparing');
      expect(actor.getSnapshot().context.resendAvailableAt).toBe(61_000);

      actor.send({ type: 'TYPE', value: '123456' });
      actor.send({ type: 'SUBMIT' });
      expect(actor.getSnapshot().context.inputValue).toBe('123456');
      expect(attempt).not.toHaveBeenCalled();

      resend.resolve();
      await vi.waitFor(() => expect(attempt).toHaveBeenCalledWith(email, '123456'));
    } finally {
      now.mockRestore();
    }
  });
});

describe('useReverificationController', () => {
  it('is idle when reverification is not active', () => {
    const { result } = renderHook(() => useReverificationController(readyModel({ isActive: false })));
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
    const cancel = vi.fn();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({ start: vi.fn(async () => Promise.reject(new Error('no session'))), cancel }),
      ),
    );
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('is unavailable when start returns no methods', async () => {
    const cancel = vi.fn();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [], startingMethod: null })),
          cancel,
        }),
      ),
    );
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('still passes onShowMethods when only one method is available', async () => {
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
    expect(result.current.onShowMethods).toEqual(expect.any(Function));
    expect(result.current.methods).toEqual([]);
    expect(result.current.step).toBe('password');
  });

  it('keeps onResend during the resend cooldown', async () => {
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [email], startingMethod: email })),
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    if (result.current.status !== 'ready') {
      throw new Error('expected ready');
    }
    expect(result.current.canResend).toBe(false);
    expect(result.current.onResend).toEqual(expect.any(Function));
    expect(result.current.resendRemainingSeconds).toBeGreaterThan(0);
    expect(result.current.resendRemainingSeconds).toBeLessThanOrEqual(30);
  });

  it('marks the current step pending while an attempt is in flight', async () => {
    const attempt = deferred<ReverificationResult>();
    const { result } = renderHook(() => useReverificationController(readyModel({ attempt: () => attempt.promise })));

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

  it('stays on the current step with the error when finish fails', async () => {
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          attempt: vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null })),
          finish: vi.fn(async () => Promise.reject(new Error('Session could not be activated.'))),
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
        expect(result.current.isPending).toBe(false);
        expect(result.current.errorMessage).toBe('Session could not be activated.');
      }
    });
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

  it('shows the factor idle while the starting prepare is in flight', async () => {
    const prepare = deferred<void>();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [email, password], startingMethod: email })),
          prepare: () => prepare.promise,
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    if (result.current.status !== 'ready') {
      throw new Error('expected ready');
    }
    expect(result.current.step).toBe('otp');
    expect(result.current.isPending).toBe(false);
    expect(result.current.canResend).toBe(false);
    expect(result.current.pendingMethodId).toBeUndefined();

    const onValueChange = result.current.onValueChange;
    act(() => {
      onValueChange('123456');
    });
    expect(result.current.status).toBe('ready');
    if (result.current.status === 'ready') {
      expect(result.current.value).toBe('123456');
    }

    act(() => {
      prepare.resolve();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status === 'ready') {
        expect(result.current.canResend).toBe(false);
        expect(result.current.isPending).toBe(false);
      }
    });
  });

  it('does not attempt until the starting prepare settles after submit', async () => {
    const prepare = deferred<void>();
    const attempt = vi.fn(async () => firstFactorResult({ status: 'complete', methods: [], startingMethod: null }));
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          start: vi.fn(async () => firstFactorResult({ methods: [email], startingMethod: email })),
          prepare: () => prepare.promise,
          attempt,
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onValueChange('123456');
        result.current.onSubmit();
      }
    });
    expect(attempt).not.toHaveBeenCalled();
    if (result.current.status === 'ready') {
      expect(result.current.isPending).toBe(false);
    }

    act(() => {
      prepare.resolve();
    });
    await waitFor(() => expect(attempt).toHaveBeenCalledOnce());
  });

  it('keeps the picker on the sending row until prepare settles', async () => {
    const prepare = deferred<void>();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          prepare: () => prepare.promise,
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onShowMethods();
      }
    });
    if (result.current.status !== 'ready') {
      throw new Error('expected ready');
    }
    expect(result.current.step).toBe('method-picker');

    const onSelectMethod = result.current.onSelectMethod;
    act(() => {
      onSelectMethod(email.id);
    });
    if (result.current.status !== 'ready') {
      throw new Error('expected ready');
    }
    expect(result.current.step).toBe('method-picker');
    expect(result.current.pendingMethodId).toBe(email.id);
    expect(result.current.isPending).toBe(false);
    expect(result.current.methods.some(method => method.id === email.id)).toBe(true);
    expect(result.current.onBack).toEqual(expect.any(Function));

    act(() => {
      prepare.resolve();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status === 'ready') {
        expect(result.current.step).toBe('otp');
        expect(result.current.pendingMethodId).toBeUndefined();
        expect(result.current.canResend).toBe(false);
      }
    });
  });

  it('shows the factor with the error when a picker prepare fails', async () => {
    const prepare = deferred<void>();
    const { result } = renderHook(() =>
      useReverificationController(
        readyModel({
          prepare: () => prepare.promise,
        }),
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      if (result.current.status === 'ready') {
        result.current.onShowMethods();
        result.current.onSelectMethod(email.id);
      }
    });

    act(() => {
      prepare.reject(new Error('Could not send the code.'));
    });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      if (result.current.status === 'ready') {
        expect(result.current.step).toBe('otp');
        expect(result.current.errorMessage).toBe('Could not send the code.');
        expect(result.current.pendingMethodId).toBeUndefined();
        expect(result.current.canResend).toBe(true);
      }
    });
  });
});
