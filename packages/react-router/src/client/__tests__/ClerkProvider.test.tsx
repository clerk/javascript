import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockClerkProvider = vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

vi.mock('@clerk/react', () => ({
  ClerkProvider: (props: any) => mockClerkProvider(props),
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  UNSAFE_DataRouterContext: React.createContext(null),
}));

vi.mock('../../utils/assert', () => ({
  assertPublishableKeyInSpaMode: vi.fn(),
  assertValidClerkState: vi.fn(),
  isSpaMode: () => true,
  warnForSsr: vi.fn(),
}));

describe('ClerkProvider clerkUIUrl prop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passes clerkUIUrl prop to the underlying ClerkProvider', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    render(
      <ClerkProvider
        publishableKey='pk_test_xxx'
        clerkUIUrl='https://custom.clerk.ui/ui.js'
      >
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkUIUrl: 'https://custom.clerk.ui/ui.js',
      }),
    );
  });

  it('passes clerkUIUrl as undefined when not provided', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    render(
      <ClerkProvider publishableKey='pk_test_xxx'>
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkUIUrl: undefined,
      }),
    );
  });

  it('passes clerkUIUrl alongside other props', async () => {
    const { ClerkProvider } = await import('../ReactRouterClerkProvider');

    render(
      <ClerkProvider
        publishableKey='pk_test_xxx'
        clerkUIUrl='https://custom.clerk.ui/ui.js'
        clerkJSUrl='https://custom.clerk.js/clerk.js'
        signInUrl='/sign-in'
        signUpUrl='/sign-up'
      >
        <div>Test</div>
      </ClerkProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkUIUrl: 'https://custom.clerk.ui/ui.js',
        clerkJSUrl: 'https://custom.clerk.js/clerk.js',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      }),
    );
  });
});
