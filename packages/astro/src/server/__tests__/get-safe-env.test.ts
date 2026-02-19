import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClientSafeEnv, getSafeEnv } from '../get-safe-env';

function createLocals(overrides: Partial<App.Locals> = {}) {
  return {
    runtime: { env: {} as InternalEnv },
    ...overrides,
  } as App.Locals;
}

describe('getSafeEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('CLERK_SECRET_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads from locals.runtime.env first (Cloudflare)', () => {
    const locals = createLocals({
      runtime: {
        env: {
          PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_from_runtime',
          CLERK_SECRET_KEY: 'sk_from_runtime',
        } as InternalEnv,
      },
    });

    // Also set process.env to verify runtime.env takes priority
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';
    process.env.CLERK_SECRET_KEY = 'sk_from_process';

    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_from_runtime');
    expect(env.sk).toBe('sk_from_runtime');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('reads from import.meta.env when runtime.env is not available', () => {
    vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_from_meta');
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_from_meta');

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_from_meta');
    expect(env.sk).toBe('sk_from_meta');
  });

  it('falls back to process.env when import.meta.env has no value', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';
    process.env.CLERK_SECRET_KEY = 'sk_from_process';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_from_process');
    expect(env.sk).toBe('sk_from_process');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('returns undefined when no env source has the value', () => {
    // Clean process.env so the fallback finds nothing
    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getSafeEnv(locals);

    expect(env.pk).toBeUndefined();
    expect(env.sk).toBeUndefined();
  });

  it('prefers keylessPublishableKey over all env sources', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';

    const locals = createLocals({
      runtime: { env: undefined as unknown as InternalEnv },
      keylessPublishableKey: 'pk_keyless',
    });
    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_keyless');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  });
});

describe('getClientSafeEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to process.env for publishableKey', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getClientSafeEnv(locals);

    expect(env.publishableKey).toBe('pk_from_process');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  });

  it('falls back to process.env for all public env vars', () => {
    process.env.PUBLIC_CLERK_DOMAIN = 'test.domain.com';
    process.env.PUBLIC_CLERK_SIGN_IN_URL = '/sign-in';
    process.env.PUBLIC_CLERK_SIGN_UP_URL = '/sign-up';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getClientSafeEnv(locals);

    expect(env.domain).toBe('test.domain.com');
    expect(env.signInUrl).toBe('/sign-in');
    expect(env.signUpUrl).toBe('/sign-up');

    delete process.env.PUBLIC_CLERK_DOMAIN;
    delete process.env.PUBLIC_CLERK_SIGN_IN_URL;
    delete process.env.PUBLIC_CLERK_SIGN_UP_URL;
  });
});
