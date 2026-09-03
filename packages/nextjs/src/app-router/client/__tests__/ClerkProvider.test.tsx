/**
 * @vitest-environment node
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { maybeShowDevelopmentKeyNotice } from '../../../utils/devKeyNotice';
import { ClientClerkProvider } from '../ClerkProvider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('../useAwaitablePush', () => ({ useAwaitablePush: () => vi.fn() }));
vi.mock('../useAwaitableReplace', () => ({ useAwaitableReplace: () => vi.fn() }));
vi.mock('../../server-actions', () => ({ invalidateCacheAction: vi.fn() }));
vi.mock('../ClerkScripts', () => ({ ClerkScripts: () => null }));
vi.mock('../../../utils/router-telemetry', () => ({ RouterTelemetry: () => null }));
vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../../utils/devKeyNotice', () => ({ maybeShowDevelopmentKeyNotice: vi.fn() }));

const notice = maybeShowDevelopmentKeyNotice as unknown as ReturnType<typeof vi.fn>;
const DEV_KEY = 'pk_test_ZmFrZS1jbGVyay5hY2NvdW50cy5kZXYk';
const ORIGINAL_ENV = { ...process.env };

describe('ClientClerkProvider (server render)', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING;
    notice.mockClear();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('asks for the development key notice with the resolved key', () => {
    const html = renderToStaticMarkup(<ClientClerkProvider publishableKey={DEV_KEY}>child</ClientClerkProvider>);

    expect(html).toContain('child');
    expect(notice).toHaveBeenCalledTimes(1);
    expect(notice).toHaveBeenCalledWith({ publishableKey: DEV_KEY, disabled: false, keyless: false });
  });

  it('passes the opt-out through when set as a prop', () => {
    renderToStaticMarkup(
      <ClientClerkProvider
        publishableKey={DEV_KEY}
        unsafe_disableDevelopmentModeConsoleWarning
      >
        child
      </ClientClerkProvider>,
    );

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });

  it('passes the opt-out through when set by env var', () => {
    process.env.NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING = 'true';

    renderToStaticMarkup(<ClientClerkProvider publishableKey={DEV_KEY}>child</ClientClerkProvider>);

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });

  it('flags keys that came from keyless mode', () => {
    renderToStaticMarkup(
      <ClientClerkProvider
        publishableKey={DEV_KEY}
        __internal_keyless_claimKeylessApplicationUrl='https://dashboard.clerk.com/claim'
      >
        child
      </ClientClerkProvider>,
    );

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ keyless: true }));
  });
});
