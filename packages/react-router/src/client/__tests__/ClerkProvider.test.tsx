import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockClerkProvider = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: (props: any) => mockClerkProvider(props),
}));

vi.mock('@clerk/react', () => ({}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  UNSAFE_DataRouterContext: React.createContext(null),
}));

vi.mock('../../utils/assert', () => ({
  assertPublishableKeyInSpaMode: vi.fn(),
  assertValidClerkState: vi.fn(),
  isSpaMode: () => false,
  warnForSsr: vi.fn(),
}));

describe('ClerkProvider __internal_clerkUIUrl via clerkState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passes __internal_clerkUIUrl from clerkState to the underlying ClerkProvider', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    const clerkState = {
      __type: 'clerkState' as const,
      __internal_clerk_state: {
        __clerk_ssr_state: undefined,
        __publishableKey: 'pk_test_xxx',
        __clerkUIUrl: 'https://custom.clerk.ui/ui.js',
      },
    };

    render(
      <ClerkProvider loaderData={{ clerkState }}>
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        __internal_clerkUIUrl: 'https://custom.clerk.ui/ui.js',
      }),
    );
  });

  it('passes __internal_clerkUIUrl as undefined when not in clerkState', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    render(
      <ClerkProvider publishableKey='pk_test_xxx'>
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        __internal_clerkUIUrl: undefined,
      }),
    );
  });

  it('passes __internal_clerkUIUrl alongside other props from clerkState', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    const clerkState = {
      __type: 'clerkState' as const,
      __internal_clerk_state: {
        __clerk_ssr_state: undefined,
        __publishableKey: 'pk_test_xxx',
        __clerkUIUrl: 'https://custom.clerk.ui/ui.js',
        __clerkJSUrl: 'https://custom.clerk.js/clerk.js',
        __signInUrl: '/sign-in',
        __signUpUrl: '/sign-up',
      },
    };

    render(
      <ClerkProvider loaderData={{ clerkState }}>
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        __internal_clerkUIUrl: 'https://custom.clerk.ui/ui.js',
        __internal_clerkJSUrl: 'https://custom.clerk.js/clerk.js',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      }),
    );
  });
});
