import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkAPIResponseError } from '@/error';
import type { ProtectCheckResource } from '@/types';

import {
  executeProtectCheckWithTimeout,
  isProtectCheckExpired,
  submitProtectCheckProof,
} from '../protectCheckLifecycle';

vi.mock('../protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '../protectCheck';

const mockExecute = vi.mocked(executeProtectCheck);

const protectCheck = (overrides: Partial<ProtectCheckResource> = {}): ProtectCheckResource => ({
  status: 'pending',
  token: 'challenge-token',
  sdkUrl: 'https://protect.example.com/sdk.js',
  ...overrides,
});

const alreadyResolvedError = () =>
  new ClerkAPIResponseError('Already resolved', {
    data: [{ code: 'protect_check_already_resolved', message: 'Already resolved', long_message: '' }],
    status: 400,
    clerkTraceId: 'trace_123',
  });

beforeEach(() => {
  mockExecute.mockReset();
});

describe('isProtectCheckExpired', () => {
  it('is false when expiresAt is absent', () => {
    expect(isProtectCheckExpired(protectCheck())).toBe(false);
  });

  it('compares expiresAt (unix milliseconds) against now', () => {
    expect(isProtectCheckExpired(protectCheck({ expiresAt: Date.now() - 1_000 }))).toBe(true);
    expect(isProtectCheckExpired(protectCheck({ expiresAt: Date.now() + 60_000 }))).toBe(false);
  });
});

describe('executeProtectCheckWithTimeout', () => {
  it('clears the container before running so a previous run cannot leave a stale widget', async () => {
    const container = document.createElement('div');
    container.appendChild(document.createElement('span'));
    mockExecute.mockResolvedValue('proof-token');

    await executeProtectCheckWithTimeout(protectCheck(), container);

    expect(container.childNodes.length).toBe(0);
  });

  it('resolves with the proof token and forwards the challenge to executeProtectCheck', async () => {
    const container = document.createElement('div');
    mockExecute.mockResolvedValue('proof-token');

    const check = protectCheck({ token: 'opaque', uiHints: { reason: 'device_new' } });
    await expect(executeProtectCheckWithTimeout(check, container)).resolves.toBe('proof-token');

    expect(mockExecute).toHaveBeenCalledWith(
      check,
      container,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  describe('timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('aborts the SDK and rejects with protect_check_timed_out when the script never settles', async () => {
      const container = document.createElement('div');
      let sdkSignal: AbortSignal | undefined;
      mockExecute.mockImplementation((_check, _container, opts) => {
        sdkSignal = opts?.signal;
        return new Promise(() => {}); // hung SDK
      });

      const promise = executeProtectCheckWithTimeout(protectCheck(), container, { timeoutMs: 1_000 });
      const assertion = expect(promise).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      await vi.advanceTimersByTimeAsync(1_000);
      await assertion;
      expect(sdkSignal?.aborted).toBe(true);
    });

    it('does not abort the caller controller on timeout', async () => {
      const container = document.createElement('div');
      const caller = new AbortController();
      mockExecute.mockImplementation(() => new Promise(() => {}));

      const promise = executeProtectCheckWithTimeout(protectCheck(), container, {
        signal: caller.signal,
        timeoutMs: 1_000,
      });
      const assertion = expect(promise).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      await vi.advanceTimersByTimeAsync(1_000);
      await assertion;
      expect(caller.signal.aborted).toBe(false);
    });

    it('swallows setWidgetVisible signals from a zombie script after timeout', async () => {
      const container = document.createElement('div');
      const setWidgetVisible = vi.fn().mockResolvedValue(undefined);
      let scriptSetWidgetVisible: ((visible: boolean) => Promise<void>) | undefined;
      mockExecute.mockImplementation((_check, _container, opts) => {
        scriptSetWidgetVisible = opts?.setWidgetVisible;
        return new Promise(() => {});
      });

      const promise = executeProtectCheckWithTimeout(protectCheck(), container, { setWidgetVisible, timeoutMs: 1_000 });
      const assertion = expect(promise).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      await vi.advanceTimersByTimeAsync(1_000);
      await assertion;

      await scriptSetWidgetVisible!(true);
      expect(setWidgetVisible).not.toHaveBeenCalled();
    });

    it('clears the timeout once the script settles', async () => {
      const container = document.createElement('div');
      mockExecute.mockResolvedValue('proof-token');

      await expect(executeProtectCheckWithTimeout(protectCheck(), container, { timeoutMs: 1_000 })).resolves.toBe(
        'proof-token',
      );

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it('links the caller signal into the SDK signal (one-way)', async () => {
    const container = document.createElement('div');
    const caller = new AbortController();
    let sdkSignal: AbortSignal | undefined;
    mockExecute.mockImplementation((_check, _container, opts) => {
      sdkSignal = opts?.signal;
      return new Promise(() => {});
    });

    void executeProtectCheckWithTimeout(protectCheck(), container, { signal: caller.signal, timeoutMs: 50 }).catch(
      () => {},
    );
    await vi.waitFor(() => expect(mockExecute).toHaveBeenCalled());
    expect(sdkSignal?.aborted).toBe(false);

    caller.abort();
    expect(sdkSignal?.aborted).toBe(true);
  });

  it('passes an already-aborted signal through to the SDK', async () => {
    const container = document.createElement('div');
    const caller = new AbortController();
    caller.abort();
    let sdkSignal: AbortSignal | undefined;
    mockExecute.mockImplementation((_check, _container, opts) => {
      sdkSignal = opts?.signal;
      return Promise.resolve('unused');
    });

    await executeProtectCheckWithTimeout(protectCheck(), container, { signal: caller.signal });
    expect(sdkSignal?.aborted).toBe(true);
  });

  it('forwards visibility signals from a live run', async () => {
    const container = document.createElement('div');
    const setWidgetVisible = vi.fn().mockResolvedValue(undefined);
    mockExecute.mockImplementation(async (_check, _container, opts) => {
      await opts?.setWidgetVisible?.(true);
      return 'proof-token';
    });

    await executeProtectCheckWithTimeout(protectCheck(), container, { setWidgetVisible });
    expect(setWidgetVisible).toHaveBeenCalledWith(true);
  });
});

describe('submitProtectCheckProof', () => {
  it('returns the submitted resource on success', async () => {
    const updated = { id: 'si_updated' };
    const submit = vi.fn().mockResolvedValue(updated);

    const result = await submitProtectCheckProof({
      proofToken: 'proof-abc',
      submitProtectCheck: submit,
      reload: vi.fn(),
      getResource: () => ({ id: 'si_live' }),
    });

    expect(submit).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    expect(result).toEqual({ status: 'submitted', resource: updated });
  });

  it('treats protect_check_already_resolved as soft success: reloads and returns the live resource', async () => {
    const live = { id: 'si_live' };
    const reload = vi.fn().mockResolvedValue(undefined);

    const result = await submitProtectCheckProof({
      proofToken: 'proof-abc',
      submitProtectCheck: vi.fn().mockRejectedValue(alreadyResolvedError()),
      reload,
      getResource: () => live,
    });

    expect(reload).toHaveBeenCalled();
    expect(result).toEqual({ status: 'already_resolved', resource: live });
  });

  it('returns cancelled (and does not reload) when the caller cancelled during a failing submit', async () => {
    const reload = vi.fn();

    const result = await submitProtectCheckProof({
      proofToken: 'proof-abc',
      submitProtectCheck: vi.fn().mockRejectedValue(alreadyResolvedError()),
      reload,
      getResource: () => ({}),
      isCancelled: () => true,
    });

    expect(result).toEqual({ status: 'cancelled' });
    expect(reload).not.toHaveBeenCalled();
  });

  it('rethrows any other submit failure untouched', async () => {
    const failure = new ClerkAPIResponseError('Blocked', {
      data: [{ code: 'action_blocked', message: 'Blocked', long_message: '' }],
      status: 403,
      clerkTraceId: 'trace_456',
    });

    await expect(
      submitProtectCheckProof({
        proofToken: 'proof-abc',
        submitProtectCheck: vi.fn().mockRejectedValue(failure),
        reload: vi.fn(),
        getResource: () => ({}),
      }),
    ).rejects.toBe(failure);
  });
});
