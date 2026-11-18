import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkAPIResponseError } from '@/error';
import type { ProtectCheckResource } from '@/types';

import type { ProtectCheckRunOptions } from '../protectCheckRunner';
import { MAX_EXPIRED_PROTECT_CHECK_RELOADS, runProtectCheck } from '../protectCheckRunner';

vi.mock('../protectCheck', () => ({
  executeProtectCheck: vi.fn(),
}));

import { executeProtectCheck } from '../protectCheck';

const mockExecute = vi.mocked(executeProtectCheck);

type Resource = { id: string; protectCheck: ProtectCheckResource | null };

const challenge = (overrides: Partial<ProtectCheckResource> = {}): ProtectCheckResource => ({
  status: 'pending',
  token: 'challenge-token',
  sdkUrl: 'https://protect.example.com/sdk.js',
  ...overrides,
});

const alreadyResolved = () =>
  new ClerkAPIResponseError('already resolved', {
    status: 400,
    data: [{ code: 'protect_check_already_resolved', message: 'already resolved' }],
  });

const setup = (initial: ProtectCheckResource | null = challenge()) => {
  const live: Resource = { id: 'live', protectCheck: initial };
  const submitted: Resource = { id: 'submitted', protectCheck: null };
  const ops = {
    getProtectCheck: vi.fn(() => live.protectCheck),
    getResource: vi.fn(() => live),
    reload: vi.fn(() => Promise.resolve()),
    submitProtectCheck: vi.fn(() => Promise.resolve(submitted)),
  };
  const container = document.createElement('div');
  const expiredReloads = { current: 0 };
  const run = (check: ProtectCheckResource, options: Partial<ProtectCheckRunOptions> = {}) =>
    runProtectCheck<Resource>(ops, check, { container, expiredReloads, ...options });
  return { live, submitted, ops, container, expiredReloads, run };
};

beforeEach(() => {
  mockExecute.mockReset();
  mockExecute.mockResolvedValue('proof-abc');
});

describe('ProtectCheckRunner', () => {
  it('executes the challenge in the container and submits the proof token', async () => {
    const { run, ops, container, submitted } = setup();
    const signal = new AbortController().signal;
    const setWidgetVisible = vi.fn(() => Promise.resolve());

    const outcome = await run(challenge(), { container, signal, setWidgetVisible, loadTimeoutMs: 1234 });

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({ token: 'challenge-token' }), container, {
      signal,
      setWidgetVisible,
      loadTimeoutMs: 1234,
    });
    expect(ops.submitProtectCheck).toHaveBeenCalledWith({ proofToken: 'proof-abc' });
    expect(outcome).toEqual({ status: 'resolved', resource: submitted });
  });

  it('does nothing when the signal is already aborted, even for an expired challenge', async () => {
    const { run, ops, container } = setup();
    const controller = new AbortController();
    controller.abort();

    await expect(
      run(challenge({ expiresAt: Date.now() - 1000 }), { container, signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'protect_check_aborted' });
    expect(ops.reload).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('does not submit a proof token that arrives after the signal aborted', async () => {
    const { run, ops, container } = setup();
    const controller = new AbortController();
    mockExecute.mockImplementation(() => {
      controller.abort();
      return Promise.resolve('late-proof');
    });

    await expect(run(challenge(), { container, signal: controller.signal })).rejects.toMatchObject({
      code: 'protect_check_aborted',
    });
    expect(ops.submitProtectCheck).not.toHaveBeenCalled();
  });

  it('does not submit when the challenge script fails', async () => {
    const { run, ops, container } = setup();
    mockExecute.mockRejectedValue(new Error('script failed'));

    await expect(run(challenge(), { container })).rejects.toThrow('script failed');
    expect(ops.submitProtectCheck).not.toHaveBeenCalled();
  });

  it('treats protect_check_already_resolved as resolved after a reload', async () => {
    const { run, ops, container, live } = setup();
    ops.submitProtectCheck.mockRejectedValue(alreadyResolved());
    ops.reload.mockImplementation(() => {
      live.protectCheck = null;
      return Promise.resolve();
    });

    const outcome = await run(challenge(), { container });

    expect(ops.reload).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({ status: 'resolved', resource: live });
  });

  it('does not reload or resolve an already-resolved submit once the signal aborted', async () => {
    const { run, ops, container } = setup();
    const controller = new AbortController();
    ops.submitProtectCheck.mockImplementation(() => {
      controller.abort();
      return Promise.reject(alreadyResolved());
    });

    await expect(run(challenge(), { container, signal: controller.signal })).rejects.toMatchObject({
      code: 'protect_check_aborted',
    });
    expect(ops.reload).not.toHaveBeenCalled();
  });

  it('rethrows other submit errors without a reload', async () => {
    const { run, ops, container } = setup();
    ops.submitProtectCheck.mockRejectedValue(new Error('network'));

    await expect(run(challenge(), { container })).rejects.toThrow('network');
    expect(ops.reload).not.toHaveBeenCalled();
  });

  describe('an expired challenge', () => {
    const expired = () => challenge({ expiresAt: Date.now() - 1000 });

    it('reloads instead of executing and resolves when the reload clears the gate', async () => {
      const { run, ops, container, live } = setup(expired());
      ops.reload.mockImplementation(() => {
        live.protectCheck = null;
        return Promise.resolve();
      });

      const outcome = await run(expired(), { container });

      expect(mockExecute).not.toHaveBeenCalled();
      expect(outcome).toEqual({ status: 'resolved', resource: live });
    });

    it('reports reissued when the reload produced a fresh challenge', async () => {
      const { run, ops, container, live } = setup(expired());
      ops.reload.mockImplementation(() => {
        live.protectCheck = challenge({ token: 'challenge-token-2', expiresAt: Date.now() + 60_000 });
        return Promise.resolve();
      });

      const outcome = await run(expired(), { container });

      expect(outcome).toEqual({ status: 'reissued' });
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('fails with protect_check_timed_out when the reload returns the same expired challenge', async () => {
      const { run, ops, container } = setup(expired());

      await expect(run(expired(), { container })).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      expect(ops.reload).toHaveBeenCalledTimes(1);
    });

    it('stops reloading once the budget is spent and resumes after the caller resets it', async () => {
      const { run, ops, container, expiredReloads } = setup(expired());

      for (let i = 0; i < MAX_EXPIRED_PROTECT_CHECK_RELOADS; i++) {
        await expect(run(expired(), { container })).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      }
      await expect(run(expired(), { container })).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      expect(ops.reload).toHaveBeenCalledTimes(MAX_EXPIRED_PROTECT_CHECK_RELOADS);

      expiredReloads.current = 0;
      await expect(run(expired(), { container })).rejects.toMatchObject({ code: 'protect_check_timed_out' });
      expect(ops.reload).toHaveBeenCalledTimes(MAX_EXPIRED_PROTECT_CHECK_RELOADS + 1);
    });
  });
});
