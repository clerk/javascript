import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAuthenticatedWebView } from '../useAuthenticatedWebView';

const mocks = vi.hoisted(() => {
  return {
    auth: { isLoaded: true, isSignedIn: true as boolean, sessionId: 'sess_0' as string | null },
    getClerkInstance: vi.fn(),
    request: vi.fn(),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useAuth: () => mocks.auth,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: { OS: 'ios' },
  };
});

vi.mock('../../provider/singleton', () => {
  return {
    getClerkInstance: mocks.getClerkInstance,
  };
});

const DESTINATION = 'https://app.example.com/billing';
const TRANSFER_URL = 'https://clerk.example.com/v1/session_transfers/redeem?token=one-time';
const redeemFailure = (code: string) =>
  `${DESTINATION}?__clerk_status=session_transfer_failed&__clerk_error_code=${code}`;

type MintResponse = ReturnType<typeof mintedResponse>;

function mintedResponse(url = TRANSFER_URL) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    payload: { response: { object: 'session_transfer', url, expires_at: Date.now() + 60_000 } },
  };
}

function refusal(status: number, code: string) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    payload: { errors: [{ code, message: code, long_message: `Refused with ${code}`, meta: {} }] },
  };
}

function deferredMint() {
  let resolve: (response: MintResponse) => void = () => {};
  const response = new Promise<MintResponse>(r => {
    resolve = r;
  });
  mocks.request.mockReturnValueOnce(response);
  return {
    deliver: async (url?: string) => {
      resolve(mintedResponse(url));
      await response;
    },
  };
}

function strictMode({ children }: { children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>;
}

function renderWebView(destination = DESTINATION, wrapper?: (props: { children: ReactNode }) => ReactNode) {
  return renderHook((props: { destination: string }) => useAuthenticatedWebView(props), {
    initialProps: { destination },
    wrapper,
  });
}

let sessionCount = 0;

describe('useAuthenticatedWebView', () => {
  beforeEach(() => {
    sessionCount += 1;
    const sessionId = `sess_${sessionCount}`;
    mocks.auth = { isLoaded: true, isSignedIn: true, sessionId };
    mocks.request.mockReset();
    mocks.getClerkInstance.mockReset();
    mocks.getClerkInstance.mockImplementation(() => ({
      loaded: true,
      session: mocks.auth.sessionId ? { id: mocks.auth.sessionId } : null,
      getFapiClient: () => ({ request: mocks.request }),
    }));
  });

  test('mints once under Strict Mode and hands the URL to the WebView', async () => {
    mocks.request.mockResolvedValue(mintedResponse());

    const { result } = renderWebView(DESTINATION, strictMode);

    expect(result.current).toMatchObject({ status: 'preparing', webViewProps: null, error: null });
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    expect(result.current.status).toBe('preparing');
    expect(result.current.webViewProps?.source).toEqual({ uri: TRANSFER_URL });
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({ body: { redirectUrl: DESTINATION, presentationMode: 'webview' } }),
    );
  });

  test('reuses the pending mint when the screen remounts before it arrives', async () => {
    const mint = deferredMint();

    const first = renderWebView();
    first.unmount();
    const second = renderWebView();
    await act(() => mint.deliver());

    expect(second.result.current.webViewProps?.source).toEqual({ uri: TRANSFER_URL });
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });

  test('gives two screens mounted for the same destination a URL each', async () => {
    const SECOND_URL = 'https://clerk.example.com/v1/session_transfers/redeem?token=second';
    const shared = deferredMint();
    mocks.request.mockResolvedValueOnce(mintedResponse(SECOND_URL));

    const first = renderWebView();
    const second = renderWebView();
    await act(() => shared.deliver());

    await waitFor(() => expect(second.result.current.webViewProps).not.toBeNull());
    expect(first.result.current.webViewProps?.source).toEqual({ uri: TRANSFER_URL });
    expect(second.result.current.webViewProps?.source).toEqual({ uri: SECOND_URL });
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  test('mints a new URL when the screen remounts after the WebView received one', async () => {
    mocks.request
      .mockResolvedValueOnce(mintedResponse())
      .mockResolvedValueOnce(mintedResponse('https://clerk.example.com/v1/session_transfers/redeem?token=second'));

    const first = renderWebView();
    await waitFor(() => expect(first.result.current.webViewProps).not.toBeNull());
    first.unmount();
    const second = renderWebView();

    await waitFor(() =>
      expect(second.result.current.webViewProps?.source.uri).toBe(
        'https://clerk.example.com/v1/session_transfers/redeem?token=second',
      ),
    );
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  test('reports ready once the WebView finishes loading past the sign-in page', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    const props = result.current.webViewProps;

    act(() => props?.onLoadStart({ nativeEvent: { url: TRANSFER_URL } }));
    act(() => props?.onLoadEnd({ nativeEvent: { url: TRANSFER_URL } }));
    expect(result.current.status).toBe('preparing');

    act(() => props?.onLoadEnd({ nativeEvent: { url: DESTINATION } }));
    expect(result.current).toMatchObject({ status: 'ready', webViewProps: props, error: null });

    act(() => props?.onLoadStart({ nativeEvent: { url: redeemFailure('expired') } }));
    expect(result.current.status).toBe('ready');
  });

  test('drops the WebView props when redeeming fails', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    const props = result.current.webViewProps;

    act(() =>
      props?.onLoadStart({
        nativeEvent: { url: redeemFailure('already_used') },
      }),
    );

    expect(result.current).toMatchObject({
      status: 'error',
      webViewProps: null,
      error: { name: 'SessionTransferError', code: 'already_used' },
    });
    expect(result.current.error?.message).not.toContain('one-time');
  });

  test('reports the redeem failure when the destination redirects on to its own sign-in page', async () => {
    const SIGN_IN = `https://app.example.com/sign-in?redirect_url=${encodeURIComponent(DESTINATION)}`;
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    const props = result.current.webViewProps;

    act(() => props?.onLoadStart({ nativeEvent: { url: TRANSFER_URL } }));
    let allowed: boolean | undefined;
    act(() => {
      allowed = props?.onShouldStartLoadWithRequest({ url: redeemFailure('expired'), isTopFrame: true });
    });
    act(() => {
      props?.onShouldStartLoadWithRequest({ url: SIGN_IN, isTopFrame: true });
    });
    act(() => props?.onLoadStart({ nativeEvent: { url: SIGN_IN } }));
    act(() => props?.onLoadEnd({ nativeEvent: { url: SIGN_IN } }));

    expect(allowed).toBe(true);
    expect(result.current).toMatchObject({ status: 'error', error: { code: 'expired' } });
  });

  test('ignores a failure URL requested by a frame inside the page', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    const props = result.current.webViewProps;

    act(() => {
      props?.onShouldStartLoadWithRequest({ url: redeemFailure('expired'), isTopFrame: false });
    });
    act(() => props?.onLoadEnd({ nativeEvent: { url: DESTINATION } }));

    expect(result.current.status).toBe('ready');
  });

  test('reports load_failed when the sign-in page returns an HTTP error', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());

    act(() => result.current.webViewProps?.onHttpError({ nativeEvent: { url: TRANSFER_URL } }));

    expect(result.current).toMatchObject({ status: 'error', webViewProps: null, error: { code: 'load_failed' } });
  });

  test('reports load_failed from the WebView error callback', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());

    act(() => result.current.webViewProps?.onError({ nativeEvent: { url: TRANSFER_URL } }));

    expect(result.current).toMatchObject({ status: 'error', error: { code: 'load_failed' } });
    expect(result.current.error?.message).not.toContain('one-time');
  });

  test('reports load_failed when the WebView fails to load', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());

    act(() => result.current.webViewProps?.onLoadEnd({ nativeEvent: { url: TRANSFER_URL, code: -1009 } }));

    expect(result.current).toMatchObject({ status: 'error', error: { code: 'load_failed' } });
  });

  test('retry mints a new URL after a failed mint', async () => {
    mocks.request.mockResolvedValueOnce(refusal(403, 'feature_not_enabled')).mockResolvedValueOnce(mintedResponse());
    const { result } = renderWebView();

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current).toMatchObject({ webViewProps: null, error: { code: 'feature_not_enabled' } });

    act(() => result.current.retry());
    expect(result.current).toMatchObject({ status: 'preparing', webViewProps: null });

    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  test('retry mints a new URL while the first mint is still waiting on Clerk', async () => {
    mocks.request.mockReturnValueOnce(new Promise(() => {})).mockResolvedValueOnce(mintedResponse());
    const { result } = renderWebView();
    expect(result.current.status).toBe('preparing');

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.webViewProps?.source).toEqual({ uri: TRANSFER_URL }));
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  test('retry after a redeem failure replaces the WebView props', async () => {
    mocks.request
      .mockResolvedValueOnce(mintedResponse())
      .mockResolvedValueOnce(mintedResponse('https://clerk.example.com/v1/session_transfers/redeem?token=second'));
    const { result } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());
    const failedProps = result.current.webViewProps;
    act(() => failedProps?.onLoadStart({ nativeEvent: { url: redeemFailure('expired') } }));
    expect(result.current).toMatchObject({ status: 'error', webViewProps: null });

    act(() => result.current.retry());

    await waitFor(() =>
      expect(result.current.webViewProps?.source.uri).toBe(
        'https://clerk.example.com/v1/session_transfers/redeem?token=second',
      ),
    );
    expect(result.current.status).toBe('preparing');
    act(() => failedProps?.onLoadEnd({ nativeEvent: { url: DESTINATION } }));
    expect(result.current.status).toBe('preparing');
  });

  test('a destination change mints for the new destination and drops the old result', async () => {
    const oldMint = deferredMint();
    mocks.request.mockResolvedValueOnce(
      mintedResponse('https://clerk.example.com/v1/session_transfers/redeem?token=new'),
    );
    const { result, rerender } = renderWebView();

    rerender({ destination: 'https://app.example.com/settings' });
    expect(result.current).toMatchObject({ status: 'preparing', webViewProps: null });
    await waitFor(() =>
      expect(result.current.webViewProps?.source.uri).toBe(
        'https://clerk.example.com/v1/session_transfers/redeem?token=new',
      ),
    );
    await act(() => oldMint.deliver());

    expect(result.current.webViewProps?.source.uri).toBe(
      'https://clerk.example.com/v1/session_transfers/redeem?token=new',
    );
    expect(mocks.request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: { redirectUrl: 'https://app.example.com/settings', presentationMode: 'webview' },
      }),
    );
  });

  test('reports signed-out without minting when there is no session', () => {
    mocks.auth = { isLoaded: true, isSignedIn: false, sessionId: null };

    const { result } = renderWebView();

    expect(result.current).toMatchObject({ status: 'signed-out', webViewProps: null, error: null });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  test('reports signed-out when the user signs out after the URL was prepared', async () => {
    mocks.request.mockResolvedValue(mintedResponse());
    const { result, rerender } = renderWebView();
    await waitFor(() => expect(result.current.webViewProps).not.toBeNull());

    mocks.auth = { isLoaded: true, isSignedIn: false, sessionId: null };
    rerender({ destination: DESTINATION });

    expect(result.current).toMatchObject({ status: 'signed-out', webViewProps: null });
  });

  test('reports signed-out when Clerk refuses the mint as signed out', async () => {
    mocks.request.mockResolvedValue(refusal(401, 'signed_out'));

    const { result } = renderWebView();

    await waitFor(() => expect(result.current.status).toBe('signed-out'));
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });

  test('waits without minting until Clerk loads', () => {
    mocks.auth = { isLoaded: false, isSignedIn: false, sessionId: null };

    const { result } = renderWebView();

    expect(result.current).toMatchObject({ status: 'preparing', webViewProps: null });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  test('reports invalid_destination without minting', async () => {
    const { result } = renderWebView('/billing');

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.code).toBe('invalid_destination');
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
