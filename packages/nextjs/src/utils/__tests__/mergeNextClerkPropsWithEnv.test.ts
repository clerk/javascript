import { afterEach, describe, expect, it } from 'vitest';

import { mergeNextClerkPropsWithEnv } from '../mergeNextClerkPropsWithEnv';

const ORIGINAL_ENV = { ...process.env };

describe('mergeNextClerkPropsWithEnv', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
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
