import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ProtectCheckJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FapiResponseJSON } from '../fapiClient';
import type { ProtectRequestContext } from '../protectCheckGate';
import {
  findPendingProtectCheck,
  PROTECT_CHECK_MODAL_CONTAINER_ID,
  PROTECT_CHECK_MODAL_WRAPPER_ID,
  ProtectCheckGate,
} from '../protectCheckGate';
import type { Clerk } from '../resources/internal';

vi.mock('@clerk/shared/internal/clerk-js/protectCheckLifecycle', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/internal/clerk-js/protectCheckLifecycle')>()),
  executeProtectCheckWithTimeout: vi.fn(),
}));

import { executeProtectCheckWithTimeout } from '@clerk/shared/internal/clerk-js/protectCheckLifecycle';

const mockExecute = vi.mocked(executeProtectCheckWithTimeout);

const checkJSON = (overrides: Partial<ProtectCheckJSON> = {}): ProtectCheckJSON => ({
  status: 'pending',
  token: 'challenge-token',
  sdk_url: 'https://protect.example.com/sdk.js',
  ...overrides,
});

const signInPayload = (protect_check: ProtectCheckJSON | null, id = 'si_1'): FapiResponseJSON<unknown> =>
  ({
    response: {
      object: 'sign_in',
      id,
      status: protect_check ? 'needs_protect_check' : 'needs_first_factor',
      protect_check,
    },
  }) as FapiResponseJSON<unknown>;

const signUpPayload = (protect_check: ProtectCheckJSON | null, id = 'su_1'): FapiResponseJSON<unknown> =>
  ({
    response: { object: 'sign_up', id, status: 'missing_requirements', protect_check },
  }) as FapiResponseJSON<unknown>;

const alreadyResolvedError = () =>
  new ClerkAPIResponseError('Already resolved', {
    data: [{ code: 'protect_check_already_resolved', message: 'Already resolved', long_message: '' }],
    status: 400,
    clerkTraceId: 'trace_123',
  });

/**
 * Fake modal host: `open` mounts the wrapper + container ids the gate queries, `close` removes
 * them — the contract the ui package's ProtectCheckModal will fulfil.
 */
const makeClerk = () => {
  const open = vi.fn(() => {
    const wrapper = document.createElement('div');
    wrapper.id = PROTECT_CHECK_MODAL_WRAPPER_ID;
    wrapper.style.visibility = 'hidden';
    const container = document.createElement('div');
    container.id = PROTECT_CHECK_MODAL_CONTAINER_ID;
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);
    return Promise.resolve();
  });
  const close = vi.fn(() => {
    document.getElementById(PROTECT_CHECK_MODAL_WRAPPER_ID)?.remove();
    return Promise.resolve();
  });
  return {
    clerk: {
      __internal_openProtectCheckModal: open,
      __internal_closeProtectCheckModal: close,
    } as unknown as Clerk,
    open,
    close,
  };
};

const makeCtx = (handlers: {
  onPatch?: (
    path: string,
    body: unknown,
  ) => FapiResponseJSON<unknown> | Promise<FapiResponseJSON<unknown> | null> | null;
  onGet?: (path: string) => FapiResponseJSON<unknown> | Promise<FapiResponseJSON<unknown> | null> | null;
  signal?: AbortSignal;
  waitForCaptchaIdle?: () => Promise<unknown>;
}) => {
  const rawFetch = vi.fn((init: { method: 'GET' | 'PATCH'; path: string; body?: unknown }) => {
    if (init.method === 'PATCH') {
      if (!handlers.onPatch) {
        throw new Error(`unexpected PATCH ${init.path}`);
      }
      return Promise.resolve(handlers.onPatch(init.path, init.body));
    }
    if (!handlers.onGet) {
      throw new Error(`unexpected GET ${init.path}`);
    }
    return Promise.resolve(handlers.onGet(init.path));
  });
  const publish = vi.fn();
  const ctx = {
    rawFetch,
    publish,
    signal: handlers.signal,
    waitForCaptchaIdle: handlers.waitForCaptchaIdle,
  } as unknown as ProtectRequestContext;
  return { ctx, rawFetch, publish };
};

beforeEach(() => {
  mockExecute.mockReset();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('findPendingProtectCheck', () => {
  it('detects a pending check on a direct sign-in response', () => {
    expect(findPendingProtectCheck(signInPayload(checkJSON()))).toEqual({
      flow: 'signIn',
      id: 'si_1',
      check: {
        status: 'pending',
        token: 'challenge-token',
        sdkUrl: 'https://protect.example.com/sdk.js',
        expiresAt: undefined,
        uiHints: undefined,
      },
    });
  });

  it('detects a pending check on a direct sign-up response', () => {
    expect(findPendingProtectCheck(signUpPayload(checkJSON()))?.flow).toBe('signUp');
  });

  it.each([
    ['null payload', null],
    ['non-auth response', { response: { object: 'client', id: 'c_1' } } as FapiResponseJSON<unknown>],
    ['no protect_check', signInPayload(null)],
    ['completed protect_check', signInPayload(checkJSON({ status: 'completed' as ProtectCheckJSON['status'] }))],
    [
      'client-nested check only (belongs to another call)',
      {
        response: {
          object: 'client',
          id: 'c_1',
          sign_in: { object: 'sign_in', id: 'si_1', protect_check: checkJSON() },
        },
      } as unknown as FapiResponseJSON<unknown>,
    ],
  ])('ignores %s', (_label, payload) => {
    expect(findPendingProtectCheck(payload)).toBeNull();
  });
});

describe('ProtectCheckGate.process', () => {
  it('passes non-gated payloads through untouched', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    const payload = signInPayload(null);
    const { ctx, rawFetch, publish } = makeCtx({});

    await expect(gate.process(clerk, payload, () => Promise.resolve(payload), ctx)).resolves.toBe(payload);
    expect(open).not.toHaveBeenCalled();
    expect(rawFetch).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('passes gated payloads through — and publishes them — while a host is registered for the flow', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    const payload = signInPayload(checkJSON());
    const { ctx, publish } = makeCtx({});
    const dispose = gate.registerHost('signIn');

    await expect(gate.process(clerk, payload, () => Promise.resolve(payload), ctx)).resolves.toBe(payload);
    expect(open).not.toHaveBeenCalled();
    // The owning surface (prebuilt card) needs the pending state that _baseFetch deferred.
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(payload);

    dispose();
    dispose(); // double-dispose must not underflow
    expect(gate.hasRegisteredHost('signIn')).toBe(false);
  });

  it('resolves a gated sign-in then REPLAYS the original operation and returns the replay result', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open, close } = makeClerk();
    mockExecute.mockResolvedValue('proof-1');
    const cleared = signInPayload(null);
    const operationResult = signInPayload(null); // e.g. the prepare that finally ran
    const { ctx, rawFetch, publish } = makeCtx({ onPatch: () => cleared });
    const replay = vi.fn(() => Promise.resolve(operationResult));

    const result = await gate.process(clerk, signInPayload(checkJSON()), replay, ctx);

    // The PATCH only clears the gate; the caller's operation must be re-run for its side effect.
    expect(result).toBe(operationResult);
    expect(replay).toHaveBeenCalledTimes(1);
    const patchOrder = rawFetch.mock.invocationCallOrder[0];
    const replayOrder = replay.mock.invocationCallOrder[0];
    expect(patchOrder).toBeLessThan(replayOrder);
    expect(open).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'challenge-token', sdkUrl: 'https://protect.example.com/sdk.js' }),
      expect.any(HTMLElement),
      expect.objectContaining({ setWidgetVisible: expect.any(Function) }),
    );
    expect(mockExecute.mock.calls[0][1].id).toBe(PROTECT_CHECK_MODAL_CONTAINER_ID);
    expect(rawFetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/client/sign_ins/si_1/protect_check',
      body: { proof_token: 'proof-1' },
    });
    // Managed resolutions never publish the intermediate gated state.
    expect(publish).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('uses the sign-up endpoints for gated sign-ups', async () => {
    const gate = new ProtectCheckGate();
    const { clerk } = makeClerk();
    mockExecute.mockResolvedValue('proof-su');
    const { ctx, rawFetch } = makeCtx({ onPatch: () => signUpPayload(null) });

    await gate.process(clerk, signUpPayload(checkJSON()), () => Promise.resolve(signUpPayload(null)), ctx);

    expect(rawFetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/client/sign_ups/su_1/protect_check',
      body: { proof_token: 'proof-su' },
    });
  });

  it('runs inline into the clerk-protect-check placement marker and clears it on release', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    const marker = document.createElement('div');
    marker.id = 'clerk-protect-check';
    document.body.appendChild(marker);
    mockExecute.mockImplementation((_check, container) => {
      container.appendChild(document.createElement('iframe')); // the widget
      return Promise.resolve('proof-1');
    });
    const { ctx } = makeCtx({ onPatch: () => signInPayload(null) });

    await gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);

    expect(open).not.toHaveBeenCalled();
    expect(mockExecute.mock.calls[0][1]).toBe(marker);
    // Marker stays (customer's node); the run's widget leftovers do not.
    expect(document.getElementById('clerk-protect-check')).toBe(marker);
    expect(marker.childNodes.length).toBe(0);
  });

  it('falls back to the modal when the placement marker is not a <div>', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const marker = document.createElement('span');
    marker.id = 'clerk-protect-check';
    document.body.appendChild(marker);
    mockExecute.mockResolvedValue('proof-1');
    const { ctx } = makeCtx({ onPatch: () => signInPayload(null) });

    await gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);

    expect(open).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must be a <div>'));
    warn.mockRestore();
  });

  it('loops chained challenges inside one host session, then replays once', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open, close } = makeClerk();
    mockExecute.mockResolvedValueOnce('proof-1').mockResolvedValueOnce('proof-2');
    const chained = signInPayload(checkJSON({ token: 'challenge-token-2' }));
    let patchCount = 0;
    const { ctx } = makeCtx({ onPatch: () => (++patchCount === 1 ? chained : signInPayload(null)) });
    const operationResult = signInPayload(null);
    const replay = vi.fn(() => Promise.resolve(operationResult));

    const result = await gate.process(clerk, signInPayload(checkJSON()), replay, ctx);

    expect(result).toBe(operationResult);
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute.mock.calls[1][0]).toEqual(expect.objectContaining({ token: 'challenge-token-2' }));
    expect(replay).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('gives up on a never-ending challenge chain and closes the host', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, close } = makeClerk();
    let n = 0;
    mockExecute.mockImplementation(() => Promise.resolve(`proof-${n}`));
    const { ctx } = makeCtx({ onPatch: () => signInPayload(checkJSON({ token: `challenge-token-${++n}` })) });

    await expect(
      gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx),
    ).rejects.toMatchObject({ code: 'protect_check_execution_failed' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('throws instead of returning a still-pending payload when replays keep coming back gated', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    mockExecute.mockResolvedValue('proof-x');
    const { ctx } = makeCtx({ onPatch: () => signInPayload(null) });
    // Every replay of the operation comes back gated again — pathological server.
    const replay = vi.fn(() => Promise.resolve(signInPayload(checkJSON())));

    await expect(gate.process(clerk, signInPayload(checkJSON()), replay, ctx)).rejects.toMatchObject({
      code: 'protect_check_execution_failed',
    });
    expect(replay).toHaveBeenCalledTimes(3);
    expect(open).toHaveBeenCalledTimes(3);
  });

  it('treats protect_check_already_resolved as soft success: reloads, then replays', async () => {
    const gate = new ProtectCheckGate();
    const { clerk } = makeClerk();
    mockExecute.mockResolvedValue('proof-1');
    const { ctx, rawFetch } = makeCtx({
      onPatch: () => {
        throw alreadyResolvedError();
      },
      onGet: () => signInPayload(null),
    });
    const operationResult = signInPayload(null);
    const replay = vi.fn(() => Promise.resolve(operationResult));

    const result = await gate.process(clerk, signInPayload(checkJSON()), replay, ctx);

    expect(result).toBe(operationResult);
    expect(replay).toHaveBeenCalledTimes(1);
    expect(rawFetch).toHaveBeenCalledWith(
      { method: 'GET', path: '/client/sign_ins/si_1' },
      { forceUpdateClient: true },
    );
  });

  it('reloads an expired challenge before running and uses the re-minted check', async () => {
    const gate = new ProtectCheckGate();
    const { clerk } = makeClerk();
    mockExecute.mockResolvedValue('proof-fresh');
    const reMinted = signInPayload(checkJSON({ token: 'challenge-token-fresh', expires_at: Date.now() + 60_000 }));
    const { ctx } = makeCtx({ onGet: () => reMinted, onPatch: () => signInPayload(null) });

    await gate.process(
      clerk,
      signInPayload(checkJSON({ expires_at: Date.now() - 1_000 })),
      () => Promise.resolve(signInPayload(null)),
      ctx,
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute.mock.calls[0][0]).toEqual(expect.objectContaining({ token: 'challenge-token-fresh' }));
  });

  it('fails with protect_check_timed_out when the server keeps returning an expired challenge', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, close } = makeClerk();
    const { ctx } = makeCtx({ onGet: () => signInPayload(checkJSON({ expires_at: Date.now() - 1_000 })) });

    await expect(
      gate.process(
        clerk,
        signInPayload(checkJSON({ expires_at: Date.now() - 1_000 })),
        () => Promise.resolve(signInPayload(null)),
        ctx,
      ),
    ).rejects.toMatchObject({ code: 'protect_check_timed_out' });
    expect(mockExecute).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a null reload (offline)', null],
    ['a wrong-id response', signInPayload(null, 'si_other')],
    ['a wrong-flow response', signUpPayload(null)],
  ])('treats %s during a session as a protocol failure, not gate clearance', async (_label, badPayload) => {
    const gate = new ProtectCheckGate();
    const { clerk, close } = makeClerk();
    mockExecute.mockResolvedValue('proof-1');
    const { ctx } = makeCtx({ onPatch: () => badPayload });

    await expect(
      gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx),
    ).rejects.toMatchObject({ code: 'protect_check_execution_failed' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('propagates challenge failures and closes the host', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, close } = makeClerk();
    mockExecute.mockRejectedValue(
      Object.assign(new Error('load failed'), { code: 'protect_check_script_load_failed' }),
    );

    await expect(
      gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), makeCtx({}).ctx),
    ).rejects.toMatchObject({ code: 'protect_check_script_load_failed' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('rejects with protect_check_aborted and never opens UI when the caller signal is already aborted', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    const controller = new AbortController();
    controller.abort();
    const { ctx } = makeCtx({ signal: controller.signal });

    await expect(
      gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx),
    ).rejects.toMatchObject({ code: 'protect_check_aborted' });
    expect(open).not.toHaveBeenCalled();
  });

  it('aborting mid-challenge rejects, releases the host, and never submits', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, close } = makeClerk();
    const controller = new AbortController();
    mockExecute.mockImplementation(
      (_check, _container, opts) =>
        new Promise<string>((_resolve, reject) => {
          opts?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { code: 'protect_check_aborted' })),
          );
        }),
    );
    const { ctx, rawFetch } = makeCtx({ signal: controller.signal });

    const run = gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);
    await vi.waitFor(() => expect(mockExecute).toHaveBeenCalled());
    controller.abort();

    await expect(run).rejects.toMatchObject({ code: 'protect_check_aborted' });
    expect(rawFetch).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('fails bounded (not forever) when the modal opens but the container never appears', async () => {
    vi.useFakeTimers();
    try {
      const gate = new ProtectCheckGate();
      // Open resolves but mounts nothing — an older hot-loaded ui accepting the unknown modal name.
      const close = vi.fn(() => Promise.resolve());
      const clerk = {
        __internal_openProtectCheckModal: vi.fn(() => Promise.resolve()),
        __internal_closeProtectCheckModal: close,
      } as unknown as Clerk;
      const { ctx } = makeCtx({});

      const run = gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);
      const assertion = expect(run).rejects.toMatchObject({ code: 'protect_check_execution_failed' });
      await vi.advanceTimersByTimeAsync(5_000);
      await assertion;
      expect(close).toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('waits for the captcha coordinator before opening its own UI', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    mockExecute.mockResolvedValue('proof-1');
    let releaseCaptcha: () => void = () => undefined;
    const captchaIdle = new Promise<void>(resolve => {
      releaseCaptcha = resolve;
    });
    const { ctx } = makeCtx({ onPatch: () => signInPayload(null), waitForCaptchaIdle: () => captchaIdle });

    const run = gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(open).not.toHaveBeenCalled();

    releaseCaptcha();
    await run;
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('single-flights concurrent gated calls: second waits, then replays instead of opening a second host', async () => {
    const gate = new ProtectCheckGate();
    const { clerk, open } = makeClerk();
    let resolveProof: (token: string) => void = () => undefined;
    mockExecute.mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          resolveProof = resolve;
        }),
    );
    const { ctx } = makeCtx({ onPatch: () => signInPayload(null) });

    const firstResult = signInPayload(null);
    const firstReplay = vi.fn(() => Promise.resolve(firstResult));
    const first = gate.process(clerk, signInPayload(checkJSON()), firstReplay, ctx);
    await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(1));

    const secondResult = signInPayload(null, 'si_2');
    const secondReplay = vi.fn(() => Promise.resolve(secondResult));
    const second = gate.process(clerk, signInPayload(checkJSON(), 'si_2'), secondReplay, makeCtx({}).ctx);

    resolveProof('proof-1');
    await expect(first).resolves.toBe(firstResult);
    await expect(second).resolves.toBe(secondResult);
    expect(firstReplay).toHaveBeenCalledTimes(1);
    expect(secondReplay).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('flips the modal wrapper visible when the script announces its widget', async () => {
    const gate = new ProtectCheckGate();
    const { clerk } = makeClerk();
    mockExecute.mockImplementation(async (_check, _container, opts) => {
      await opts?.setWidgetVisible?.(true);
      return 'proof-1';
    });
    const { ctx } = makeCtx({
      onPatch: () => {
        // Wrapper must already be visible by the time the proof is submitted.
        expect(document.getElementById(PROTECT_CHECK_MODAL_WRAPPER_ID)?.style.visibility).toBe('visible');
        return signInPayload(null);
      },
    });

    await gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);
  });

  it('reveals a still-running modal after the delay so long solves are not an invisible frozen page', async () => {
    vi.useFakeTimers();
    try {
      const gate = new ProtectCheckGate();
      const { clerk } = makeClerk();
      let resolveProof: (token: string) => void = () => undefined;
      mockExecute.mockImplementationOnce(
        () =>
          new Promise<string>(resolve => {
            resolveProof = resolve;
          }),
      );
      const { ctx } = makeCtx({ onPatch: () => signInPayload(null) });

      const run = gate.process(clerk, signInPayload(checkJSON()), () => Promise.resolve(signInPayload(null)), ctx);
      await vi.waitFor(() => expect(mockExecute).toHaveBeenCalled());
      expect(document.getElementById(PROTECT_CHECK_MODAL_WRAPPER_ID)?.style.visibility).toBe('hidden');

      await vi.advanceTimersByTimeAsync(500);
      expect(document.getElementById(PROTECT_CHECK_MODAL_WRAPPER_ID)?.style.visibility).toBe('visible');

      resolveProof('proof-1');
      await run;
    } finally {
      vi.useRealTimers();
    }
  });
});
