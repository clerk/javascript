import { afterEach, describe, expect, it } from 'vitest';

import { mergeNextClerkPropsWithEnv } from '../mergeNextClerkPropsWithEnv';

const ORIGINAL_ENV = { ...process.env };

describe('mergeNextClerkPropsWithEnv', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe('unsafe_disableDevelopmentModeConsoleWarning', () => {
    it('is false when neither the prop nor the env var is set', () => {
      expect(mergeNextClerkPropsWithEnv({}).unsafe_disableDevelopmentModeConsoleWarning).toBe(false);
    });

    it('is true when set as a prop', () => {
      expect(
        mergeNextClerkPropsWithEnv({ unsafe_disableDevelopmentModeConsoleWarning: true })
          .unsafe_disableDevelopmentModeConsoleWarning,
      ).toBe(true);
    });

    it('is true when set by env var', () => {
      process.env.NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING = 'true';

      expect(mergeNextClerkPropsWithEnv({}).unsafe_disableDevelopmentModeConsoleWarning).toBe(true);
    });

    it('is true when the env var is set even if the prop is explicitly false', () => {
      process.env.NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING = '1';

      expect(
        mergeNextClerkPropsWithEnv({ unsafe_disableDevelopmentModeConsoleWarning: false })
          .unsafe_disableDevelopmentModeConsoleWarning,
      ).toBe(true);
    });
  });

  it('auto-derives a relative proxyUrl for Vercel production static generation', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({});

    expect(result.proxyUrl).toBe('/__clerk');
  });

  it('does not auto-derive proxyUrl for non-production Clerk keys', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_Zm9vLmNsZXJrLmFjY291bnRzLmRldiQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({});

    expect(result.proxyUrl).toBe('');
  });

  it('does not auto-derive proxyUrl outside Vercel production deployments', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'preview';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({});

    expect(result.proxyUrl).toBe('');
  });

  it('does not auto-derive proxyUrl when the Vercel production hostname is not eligible', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.com';

    const result = mergeNextClerkPropsWithEnv({});

    expect(result.proxyUrl).toBe('');
  });

  it('does not auto-derive proxyUrl when auto-proxy is disabled', () => {
    process.env.CLERK_DISABLE_AUTO_PROXY = 'true';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({});

    expect(result.proxyUrl).toBe('');
  });

  it('does not override an explicit proxyUrl', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({
      proxyUrl: 'https://custom-proxy.example.com/__clerk',
    });

    expect(result.proxyUrl).toBe('https://custom-proxy.example.com/__clerk');
  });

  it('does not derive proxyUrl when an explicit domain is configured', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_Zm9vLmNsZXJrLmNvbSQ=';
    process.env.VERCEL_TARGET_ENV = 'production';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

    const result = mergeNextClerkPropsWithEnv({
      domain: 'clerk.myapp.com',
    });

    expect(result.proxyUrl).toBe('');
  });
});
