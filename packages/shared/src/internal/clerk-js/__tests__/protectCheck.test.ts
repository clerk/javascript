import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProtectCheckResource } from '@/types';

import { DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS, executeProtectCheck } from '../protectCheck';

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

    it('passes only the spec-defined fields (token, uiHints, signal, setWidgetVisible) — NOT the full resource', async () => {
      const fn = vi.fn().mockResolvedValue('proof');
      vi.doMock('https://protect.example.com/sdk-args.js', () => ({ default: fn }));

      const container = fakeContainer();
      const controller = new AbortController();
      // The visibility handshake: the script calls this before revealing UI so the host can
      // drop its own spinner first; the promise resolves once the host has applied the change.
      const setWidgetVisible = vi.fn().mockResolvedValue(undefined);
      await executeProtectCheck(
        protectCheck({
          sdkUrl: 'https://protect.example.com/sdk-args.js',
          token: 'opaque-challenge-token',
          uiHints: { reason: 'device_new' },
        }),
        container,
        { signal: controller.signal, setWidgetVisible },
      );

      expect(fn).toHaveBeenCalledWith(container, {
        token: 'opaque-challenge-token',
        uiHints: { reason: 'device_new' },
        signal: controller.signal,
        setWidgetVisible,
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

    it('does not append the underlying import error (which can embed the sdkUrl) to the message', async () => {
      // Node's import error omits the URL, so the not-toContain checks below are vacuous on their own.
      // The `Original error` guard is the real one: a browser embeds the sdk_url in the import failure,
      // which must never reach the user-facing message.
      try {
        await executeProtectCheck(
          protectCheck({ sdkUrl: 'https://attacker-controlled.example/evil.js' }),
          fakeContainer(),
        );
        throw new Error('should have rejected');
      } catch (err: any) {
        expect(err.code).toBe('protect_check_script_load_failed');
        expect(err.message).toContain('invalid module.');
        expect(err.message).not.toMatch(/original error/i);
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

  describe('the load bound covers the handoff and nothing after it', () => {
    beforeEach(() => {
      // Fake only the timer functions under test. Faking the whole clock also stalls the
      // machinery that settles a dynamic import, so the module would never finish loading.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // A network that accepts the connection and then never answers is the one load failure that
    // cannot report itself — every other one rejects the import on its own.
    it('rejects as a load failure when the module never arrives', async () => {
      vi.doMock('https://protect.example.com/sdk-hangs.js', () => new Promise(() => {}));

      const running = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-hangs.js' }),
        fakeContainer(),
      );
      const assertion = expect(running).rejects.toMatchObject({ code: 'protect_check_script_load_failed' });

      await vi.advanceTimersByTimeAsync(DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS + 1);
      await assertion;
    });

    it('honours a per-instance loadTimeoutMs override instead of the default', async () => {
      vi.doMock('https://protect.example.com/sdk-hangs-2.js', () => new Promise(() => {}));

      // Expressed relative to the default, and LONGER than it, so that outliving the default is
      // itself the proof the override replaced it rather than racing alongside it.
      const override = DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS * 2;
      const running = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-hangs-2.js' }),
        fakeContainer(),
        { loadTimeoutMs: override },
      );
      let settled = false;
      const watch = running.then(
        () => (settled = true),
        () => (settled = true),
      );

      await vi.advanceTimersByTimeAsync(DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS + 1);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(override);
      await watch;
      expect(settled).toBe(true);
    });

    // An abort mid-load has to settle the operation, not leave it pending for the whole bound
    // holding its closures and timer, and it is a cancellation rather than a load failure.
    it('settles as an abort when the caller aborts during a stalled load', async () => {
      vi.doMock('https://protect.example.com/sdk-hangs-3.js', () => new Promise(() => {}));

      const controller = new AbortController();
      const running = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-hangs-3.js' }),
        fakeContainer(),
        { signal: controller.signal },
      );
      const assertion = expect(running).rejects.toMatchObject({ code: 'protect_check_aborted' });

      controller.abort();
      // No timer advanced: the abort alone must settle it, well before the load bound.
      await assertion;
    });

    // setTimeout stores its delay in a signed 32-bit int, so an oversized value overflows and
    // fires immediately — failing every load instantly, the opposite of what was configured.
    it('clamps an oversized loadTimeoutMs instead of overflowing the timer', async () => {
      vi.doMock('https://protect.example.com/sdk-hangs-4.js', () => new Promise(() => {}));

      const running = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-hangs-4.js' }),
        fakeContainer(),
        { loadTimeoutMs: 2_147_483_648 },
      );
      let settled = false;
      const watch = running.then(
        () => (settled = true),
        () => (settled = true),
      );

      // An overflowed timer would already have fired by now.
      await vi.advanceTimersByTimeAsync(1_000);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(600_000);
      await watch;
      expect(settled).toBe(true);
    });

    // The point of the whole change: the challenge owns its own duration. A challenge running far
    // longer than any load bound must still resolve — proof-of-transfer moves a server-chosen
    // number of bytes, and a host-side wall would abort it as a "timeout".
    it('never bounds the challenge once the module has taken control', async () => {
      let running = false;
      let finish!: (proofToken: string) => void;
      vi.doMock('https://protect.example.com/sdk-slow.js', () => ({
        default: () => {
          running = true;
          return new Promise<string>(resolve => (finish = resolve));
        },
      }));

      const loadTimeoutMs = 5_000;
      const execution = executeProtectCheck(
        protectCheck({ sdkUrl: 'https://protect.example.com/sdk-slow.js' }),
        fakeContainer(),
        { loadTimeoutMs },
      );
      const assertion = expect(execution).resolves.toBe('proof-after-ages');

      // Wait on the real event loop until the module has taken control, so what follows is
      // unambiguously time spent in the CHALLENGE rather than in the load.
      while (!running) {
        await new Promise(resolve => setImmediate(resolve));
      }

      // Burn far more time than the load bound. Nothing may abort the challenge for it.
      await vi.advanceTimersByTimeAsync(360 * loadTimeoutMs);
      finish('proof-after-ages');
      await assertion;
    });
  });
});
