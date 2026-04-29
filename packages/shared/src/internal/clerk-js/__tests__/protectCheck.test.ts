import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProtectCheckResource } from '@/types';

import { executeProtectCheck } from '../protectCheck';

const fakeContainer = (): HTMLDivElement => ({}) as HTMLDivElement;

const protectCheck = (overrides: Partial<ProtectCheckResource> = {}): ProtectCheckResource => ({
  status: 'pending',
  token: 'challenge-token',
  sdkUrl: 'https://protect.example.com/sdk.js',
  ...overrides,
});

describe('executeProtectCheck', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('URL validation (security)', () => {
    it('rejects non-HTTPS schemes', async () => {
      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'http://example.com/sdk.js' }), fakeContainer()),
      ).rejects.toMatchObject({ code: 'protect_check_invalid_sdk_url' });
    });

    it('rejects data: URLs (would allow inline JS injection)', async () => {
      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'data:text/javascript,export default ()=>{}' }), fakeContainer()),
      ).rejects.toMatchObject({ code: 'protect_check_invalid_sdk_url' });
    });

    it('rejects javascript: URLs', async () => {
      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'javascript:void(0)' }), fakeContainer()),
      ).rejects.toMatchObject({ code: 'protect_check_invalid_sdk_url' });
    });

    it('rejects URLs containing credentials', async () => {
      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'https://user:pass@example.com/sdk.js' }), fakeContainer()),
      ).rejects.toMatchObject({ code: 'protect_check_invalid_sdk_url' });
    });

    it('rejects unparseable URLs', async () => {
      await expect(executeProtectCheck(protectCheck({ sdkUrl: 'not a url' }), fakeContainer())).rejects.toMatchObject({
        code: 'protect_check_invalid_sdk_url',
      });
    });
  });

  describe('script invocation', () => {
    it('returns the proof token from the script default export', async () => {
      vi.doMock('https://protect.example.com/sdk-success.js', () => ({
        default: () => Promise.resolve('proof-token-123'),
      }));

      const result = await executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-success.js' }),
        fakeContainer(),
      );
      expect(result).toBe('proof-token-123');
    });

    it('passes only the spec-defined fields (token, uiHints, signal) — NOT the full resource', async () => {
      const fn = vi.fn().mockResolvedValue('proof');
      vi.doMock('https://protect.example.com/sdk-args.js', () => ({ default: fn }));

      const container = fakeContainer();
      const controller = new AbortController();
      await executeProtectCheck(
        protectCheck({
          sdkUrl: 'https://protect.example.com/sdk-args.js',
          token: 'opaque-challenge-token',
          uiHints: { reason: 'device_new' },
        }),
        container,
        { signal: controller.signal },
      );

      expect(fn).toHaveBeenCalledWith(container, {
        token: 'opaque-challenge-token',
        uiHints: { reason: 'device_new' },
        signal: controller.signal,
      });
    });
  });

  describe('cancellation', () => {
    it('rejects with protect_check_aborted if signal is already aborted before load', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'https://protect.example.com/never-loaded.js' }), fakeContainer(), {
          signal: controller.signal,
        }),
      ).rejects.toMatchObject({ code: 'protect_check_aborted' });
    });

    it('rejects with protect_check_aborted when signal is aborted during script execution', async () => {
      const controller = new AbortController();
      vi.doMock('https://protect.example.com/sdk-aborts.js', () => ({
        default: (_container: HTMLDivElement, opts: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            opts.signal?.addEventListener('abort', () => {
              const err = new Error('aborted by signal');
              err.name = 'AbortError';
              reject(err);
            });
          }),
      }));

      const promise = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-aborts.js' }),
        fakeContainer(),
        { signal: controller.signal },
      );
      controller.abort();
      await expect(promise).rejects.toMatchObject({ code: 'protect_check_aborted' });
    });

    it('rejects with protect_check_aborted when script resolves AFTER abort fires (uncooperative SDK)', async () => {
      const controller = new AbortController();
      vi.doMock('https://protect.example.com/sdk-uncooperative.js', () => ({
        default: () =>
          new Promise<string>(resolve => {
            // Resolves after a microtask, ignoring the signal entirely
            setTimeout(() => resolve('late-proof'), 10);
          }),
      }));

      const promise = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-uncooperative.js' }),
        fakeContainer(),
        { signal: controller.signal },
      );
      // Abort while the script is still running
      setTimeout(() => controller.abort(), 5);
      await expect(promise).rejects.toMatchObject({ code: 'protect_check_aborted' });
    });
  });

  describe('error wrapping', () => {
    it('wraps load failures with a CSP-aware message and code (no URL leakage)', async () => {
      // No vi.doMock for this URL → import() fails to resolve
      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'https://nonexistent.example/missing.js' }), fakeContainer()),
      ).rejects.toMatchObject({
        code: 'protect_check_script_load_failed',
        message: expect.stringContaining('Content Security Policy'),
      });
    });

    it('does not leak the sdkUrl in the user-facing load-failure message', async () => {
      try {
        await executeProtectCheck(
          protectCheck({ sdkUrl: 'https://attacker-controlled.example/evil.js' }),
          fakeContainer(),
        );
        throw new Error('should have rejected');
      } catch (err: any) {
        expect(err.message).not.toContain('attacker-controlled.example');
        expect(err.message).not.toContain('evil.js');
      }
    });

    it('rejects with protect_check_invalid_script when default export is not a function', async () => {
      vi.doMock('https://protect.example.com/sdk-no-default.js', () => ({
        default: { not: 'a function' },
      }));

      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'https://protect.example.com/sdk-no-default.js' }), fakeContainer()),
      ).rejects.toMatchObject({ code: 'protect_check_invalid_script' });
    });

    it('rejects with protect_check_execution_failed when the script throws', async () => {
      vi.doMock('https://protect.example.com/sdk-throws.js', () => ({
        default: () => Promise.reject(new Error('script went boom')),
      }));

      await expect(
        executeProtectCheck(protectCheck({ sdkUrl: 'https://protect.example.com/sdk-throws.js' }), fakeContainer()),
      ).rejects.toMatchObject({
        code: 'protect_check_execution_failed',
        message: expect.stringContaining('script went boom'),
      });
    });
  });
});
