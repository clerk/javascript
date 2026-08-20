import { PROTECT_CHECK_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import type { ProtectCheckJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FapiResponseJSON } from '../fapiClient';
import { FraudProtection } from '../fraudProtection';
import type { ProtectRequestContext } from '../protectCheckGate';
import type { Clerk } from '../resources/internal';

vi.mock('@clerk/shared/internal/clerk-js/protectCheckLifecycle', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/internal/clerk-js/protectCheckLifecycle')>()),
  executeProtectCheckWithTimeout: vi.fn(),
}));

import { executeProtectCheckWithTimeout } from '@clerk/shared/internal/clerk-js/protectCheckLifecycle';

const mockExecute = vi.mocked(executeProtectCheckWithTimeout);

const gatedPayload = (): FapiResponseJSON<unknown> =>
  ({
    response: {
      object: 'sign_in',
      id: 'si_wired',
      status: 'needs_protect_check',
      protect_check: {
        status: 'pending',
        token: 'challenge-token',
        sdk_url: 'https://protect.example.com/sdk.js',
      } satisfies ProtectCheckJSON,
    },
  }) as FapiResponseJSON<unknown>;

const clearedPayload = (): FapiResponseJSON<unknown> =>
  ({
    response: { object: 'sign_in', id: 'si_wired', status: 'complete', protect_check: null },
  }) as FapiResponseJSON<unknown>;

afterEach(() => {
  document.body.innerHTML = '';
  mockExecute.mockReset();
});

describe('FraudProtection × ProtectCheckGate wiring', () => {
  it('resolves a gated payload through the gate and returns the replayed operation result', async () => {
    // Inline marker host: keeps the wiring test free of modal plumbing.
    const marker = document.createElement('div');
    marker.id = PROTECT_CHECK_ELEMENT_ID;
    document.body.appendChild(marker);

    mockExecute.mockResolvedValue('proof-wired');
    const rawFetch = vi.fn(() => Promise.resolve(clearedPayload()));
    // First call is the gated original request; the second is the gate's replay of it.
    const operationResult = clearedPayload();
    const cb = vi
      .fn<() => Promise<FapiResponseJSON<unknown>>>()
      .mockResolvedValueOnce(gatedPayload())
      .mockResolvedValueOnce(operationResult);
    const ctx = { rawFetch, publish: vi.fn() } as unknown as ProtectRequestContext;

    const result = await FraudProtection.getInstance().execute({} as unknown as Clerk, cb, ctx);

    expect(result).toBe(operationResult);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(rawFetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/client/sign_ins/si_wired/protect_check',
      body: { proof_token: 'proof-wired' },
    });
  });

  it('returns payloads untouched when no protect context is provided (non-resource callers)', async () => {
    const payload = gatedPayload();
    await expect(
      FraudProtection.getInstance().execute({} as unknown as Clerk, () => Promise.resolve(payload)),
    ).resolves.toBe(payload);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
