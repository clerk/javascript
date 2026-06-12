import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkProvider } from '../index';

let capturedProviderProps: Record<string, unknown> | null = null;
let beforeRequest:
  | ((request: { credentials?: RequestCredentials; headers?: Headers; url?: URL }) => Promise<void>)
  | null = null;
let afterResponse: ((request: unknown, response: Response) => Promise<void>) | null = null;

const clerkConstructor = vi.hoisted(() => vi.fn());

vi.mock('@clerk/clerk-js', () => ({
  Clerk: class MockClerk {
    constructor(publishableKey: string) {
      clerkConstructor(publishableKey);
    }

    __internal_onBeforeRequest(cb: typeof beforeRequest) {
      beforeRequest = cb;
    }

    __internal_onAfterResponse(cb: typeof afterResponse) {
      afterResponse = cb;
    }
  },
}));

vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: (props: Record<string, unknown>) => {
    capturedProviderProps = props;
    return <div>{props.children as React.ReactNode}</div>;
  },
}));

vi.mock('@clerk/ui', () => ({
  ui: { ClerkUI: 'mock-ui' },
}));

describe('Electron ClerkProvider', () => {
  const tokenCache = {
    clearToken: vi.fn(),
    getToken: vi.fn(),
    saveToken: vi.fn(),
  };
  const oauthTransport = {
    getRedirectUrl: vi.fn(),
    open: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedProviderProps = null;
    beforeRequest = null;
    afterResponse = null;
    vi.stubGlobal('window', {
      __clerk_internal_electron: {
        tokenCache,
        oauthTransport,
      },
    });
  });

  it('renders React ClerkProvider with Electron defaults', () => {
    renderToStaticMarkup(
      <ClerkProvider
        publishableKey='pk_test_provider'
        signInUrl='/sign-in'
      >
        <span>App</span>
      </ClerkProvider>,
    );

    expect(clerkConstructor).toHaveBeenCalledWith('pk_test_provider');
    expect(capturedProviderProps).toMatchObject({
      publishableKey: 'pk_test_provider',
      signInUrl: '/sign-in',
      standardBrowser: false,
      ui: { ClerkUI: 'mock-ui' },
    });
    expect(capturedProviderProps?.Clerk).toBeDefined();
    expect(capturedProviderProps?.__internal_oauthTransport).toEqual({
      getRedirectUrl: expect.any(Function),
      open: expect.any(Function),
    });
  });

  it('registers an OAuth transport backed by the Electron bridge', async () => {
    oauthTransport.getRedirectUrl.mockResolvedValue('my-app://renderer/');
    oauthTransport.open.mockResolvedValue({ callbackUrl: 'my-app://renderer/?code=123' });

    renderToStaticMarkup(<ClerkProvider publishableKey='pk_test_oauth'>App</ClerkProvider>);

    const transport = capturedProviderProps?.__internal_oauthTransport as {
      getRedirectUrl: () => Promise<string>;
      open: (url: URL) => Promise<{ callbackUrl: string }>;
    };

    await expect(transport.getRedirectUrl()).resolves.toBe('my-app://renderer/');
    await expect(transport.open(new URL('https://accounts.example.com/oauth'))).resolves.toEqual({
      callbackUrl: 'my-app://renderer/?code=123',
    });
    expect(oauthTransport.open).toHaveBeenCalledWith('https://accounts.example.com/oauth');
  });

  it('adds native request params and Authorization from the Electron token cache', async () => {
    tokenCache.getToken.mockResolvedValue('client-jwt');
    renderToStaticMarkup(<ClerkProvider publishableKey='pk_test_before_request'>App</ClerkProvider>);

    const request = {
      headers: new Headers(),
      url: new URL('https://api.clerk.test/v1/client'),
    };
    await beforeRequest?.(request);

    expect(request.credentials).toBe('omit');
    expect(request.url.searchParams.get('_is_native')).toBe('1');
    expect(request.headers.get('Authorization')).toBe('Bearer client-jwt');
    expect(tokenCache.getToken).toHaveBeenCalledWith('__clerk_client_jwt');
  });

  it('stores Authorization response headers in the Electron token cache', async () => {
    renderToStaticMarkup(<ClerkProvider publishableKey='pk_test_after_response'>App</ClerkProvider>);

    await afterResponse?.(
      {},
      new Response(null, {
        headers: {
          Authorization: 'Bearer updated-client-jwt',
        },
      }),
    );

    expect(tokenCache.saveToken).toHaveBeenCalledWith('__clerk_client_jwt', 'updated-client-jwt');
  });
});
