/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetDevelopmentKeyNoticeForTests, maybeShowDevelopmentKeyNotice } from '../devKeyNotice';

// pk_test_ + base64('fake-clerk.accounts.dev$')
const DEV_KEY = 'pk_test_ZmFrZS1jbGVyay5hY2NvdW50cy5kZXYk';
const LIVE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
// pk_test_ + base64('evil.dev\nforged line$')
const DEV_KEY_WITH_NEWLINE = `pk_test_${Buffer.from('evil.dev\nforged line$').toString('base64')}`;
const ORIGINAL_ENV = { ...process.env };

describe('maybeShowDevelopmentKeyNotice', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevelopmentKeyNoticeForTests();
    // Default to the `next build` environment; individual tests override it.
    process.env.NEXT_PHASE = 'phase-production-build';
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    vi.unstubAllEnvs();
    process.env = { ...ORIGINAL_ENV };
  });

  const printed = () => logSpy.mock.calls.map((call: unknown[]) => String(call[0])).join('\n');

  it('prints once for a development key, naming clerk init and the instance', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(printed()).toContain('npx clerk@latest init');
    expect(printed()).toContain('No Clerk account or login required');
    expect(printed()).toContain('(fake-clerk.accounts.dev)');
  });

  it('prints under next dev without a build phase', () => {
    delete process.env.NEXT_PHASE;
    vi.stubEnv('NODE_ENV', 'development');

    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });

    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('prints nothing in a deployed production runtime', () => {
    delete process.env.NEXT_PHASE;
    vi.stubEnv('NODE_ENV', 'production');

    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('prints nothing in a deployed Edge Runtime', () => {
    delete process.env.NEXT_PHASE;
    vi.stubEnv('NODE_ENV', 'production');
    (globalThis as { EdgeRuntime?: string }).EdgeRuntime = 'edge-runtime';

    try {
      maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      delete (globalThis as { EdgeRuntime?: string }).EdgeRuntime;
    }
  });

  it('prints nothing for a production key', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: LIVE_KEY });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('prints nothing for a missing or malformed key', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: undefined });
    maybeShowDevelopmentKeyNotice({ publishableKey: '' });
    maybeShowDevelopmentKeyNotice({ publishableKey: 'pk_test_not-base64!' });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('prints nothing when disabled', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY, disabled: true });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('prints nothing when the keys came from keyless mode', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY, keyless: true });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('omits the instance when the decoded key is not safe to print', () => {
    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY_WITH_NEWLINE });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(printed()).not.toContain('forged');
    expect(printed()).toContain('Development keys in use.');
    expect(printed()).toContain('npx clerk@latest init');
  });

  it('prints nothing in a browser-like environment', () => {
    (globalThis as { window?: unknown }).window = {};

    try {
      maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it('prints in Next.js Edge Runtime under next dev', () => {
    delete process.env.NEXT_PHASE;
    vi.stubEnv('NODE_ENV', 'development');
    (globalThis as { EdgeRuntime?: string }).EdgeRuntime = 'edge-runtime';

    try {
      maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });
      expect(logSpy).toHaveBeenCalledTimes(1);
    } finally {
      delete (globalThis as { EdgeRuntime?: string }).EdgeRuntime;
    }
  });

  it('does not throw if console.log fails, and retries on the next call', () => {
    logSpy.mockImplementationOnce(() => {
      throw new Error('console broken');
    });

    expect(() => maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY })).not.toThrow();

    maybeShowDevelopmentKeyNotice({ publishableKey: DEV_KEY });

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(printed()).toContain('npx clerk@latest init');
  });
});
