/**
 * @vitest-environment node
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { maybeShowDevelopmentKeyNotice } from '../../utils/devKeyNotice';
import { ClerkProvider } from '../ClerkProvider';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('../ClerkScripts', () => ({ ClerkScripts: () => null }));
vi.mock('../../utils/router-telemetry', () => ({ RouterTelemetry: () => null }));
vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  setClerkJSLoadingErrorPackageName: vi.fn(),
  setErrorThrowerOptions: vi.fn(),
}));
vi.mock('../../utils/devKeyNotice', () => ({ maybeShowDevelopmentKeyNotice: vi.fn() }));

const notice = maybeShowDevelopmentKeyNotice as unknown as ReturnType<typeof vi.fn>;
const DEV_KEY = 'pk_test_ZmFrZS1jbGVyay5hY2NvdW50cy5kZXYk';
const ORIGINAL_ENV = { ...process.env };

describe('Pages Router ClerkProvider (server render)', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING;
    notice.mockClear();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('asks for the development key notice with the resolved key and opt-out', () => {
    const html = renderToStaticMarkup(<ClerkProvider publishableKey={DEV_KEY}>child</ClerkProvider>);

    expect(html).toContain('child');
    expect(notice).toHaveBeenCalledTimes(1);
    expect(notice).toHaveBeenCalledWith({ publishableKey: DEV_KEY, disabled: false });
  });

  it('passes the opt-out through when set as a prop', () => {
    renderToStaticMarkup(
      <ClerkProvider
        publishableKey={DEV_KEY}
        unsafe_disableDevelopmentModeConsoleWarning
      >
        child
      </ClerkProvider>,
    );

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });
});
