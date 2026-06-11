import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkProvider } from '../index';

let capturedProviderProps: Record<string, unknown> | null = null;
let beforeRequest:
  | ((request: { credentials?: RequestCredentials; headers?: Headers; url?: URL }) => Promise<void>)
  | null = null;
let afterResponse: ((request: unknown, response: Response) => Promise<void>) | null = null;

const clerkConstructor = vi.hoisted(() => vi.fn());
const loadClerkUIScript = vi.hoisted(() => vi.fn());

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

vi.mock('@clerk/shared/loadClerkJsScript', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  loadClerkUIScript,
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
    // Resolve the UI hotload so the provider's `ui.ClerkUI` promise does not reject during render.
    loadClerkUIScript.mockImplementation(() => {
      (window as unknown as { __internal_ClerkUICtor?: unknown }).__internal_ClerkUICtor = 'mock-ui-ctor';
      return Promise.resolve(null);
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

  it('does not wire passkeys unless they are provided', () => {
    renderToStaticMarkup(<ClerkProvider publishableKey='pk_test_no_passkeys'>App</ClerkProvider>);

    const clerk = capturedProviderProps?.Clerk as Record<string, unknown>;
    expect(clerk.__internal_createPublicCredentials).toBeUndefined();
    expect(clerk.__internal_getPublicCredentials).toBeUndefined();
    expect(clerk.__internal_isWebAuthnSupported).toBeUndefined();
  });

  it('wires the provided passkey implementation into the Clerk instance', () => {
    const passkeys = {
      create: vi.fn(),
      get: vi.fn(),
      isSupported: vi.fn(),
      isAutoFillSupported: vi.fn(),
      isPlatformAuthenticatorSupported: vi.fn(),
    };

    renderToStaticMarkup(
      <ClerkProvider
        publishableKey='pk_test_with_passkeys'
        passkeys={passkeys}
      >
        App
      </ClerkProvider>,
    );

    const clerk = capturedProviderProps?.Clerk as Record<string, unknown>;
    expect(clerk.__internal_createPublicCredentials).toBe(passkeys.create);
    expect(clerk.__internal_getPublicCredentials).toBe(passkeys.get);
    expect(clerk.__internal_isWebAuthnSupported).toBe(passkeys.isSupported);
    expect(clerk.__internal_isWebAuthnAutofillSupported).toBe(passkeys.isAutoFillSupported);
    expect(clerk.__internal_isWebAuthnPlatformAuthenticatorSupported).toBe(passkeys.isPlatformAuthenticatorSupported);
  });

  it('wires passkeys onto an instance that was cached without them', () => {
    renderToStaticMarkup(<ClerkProvider publishableKey='pk_test_cached'>App</ClerkProvider>);
    const cachedClerk = capturedProviderProps?.Clerk;

    const passkeys = {
      create: vi.fn(),
      get: vi.fn(),
      isSupported: vi.fn(),
      isAutoFillSupported: vi.fn(),
      isPlatformAuthenticatorSupported: vi.fn(),
    };
    renderToStaticMarkup(
      <ClerkProvider
        publishableKey='pk_test_cached'
        passkeys={passkeys}
      >
        App
      </ClerkProvider>,
    );

    const clerk = capturedProviderProps?.Clerk as Record<string, unknown>;
    expect(clerk).toBe(cachedClerk);
    expect(clerk.__internal_createPublicCredentials).toBe(passkeys.create);
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
