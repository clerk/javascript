import { useAuth } from '@clerk/react';
import type { Dispatch } from 'react';
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { SessionTransferError } from './errors';
import { sessionTransferError, toSessionTransferError } from './errors';
import type { SessionTransfer, TransferLease, TransferRequest } from './sessionTransfer';
import { acquireTransfer, claimTransfer, resolveTransferRequest } from './sessionTransfer';
import type { NavigationEvent, NavigationVerdict } from './webViewNavigation';
import { isRedeemPageUrl, judgeNavigation } from './webViewNavigation';

type LoadEvent = { nativeEvent: { url: string } };
type LoadEndEvent = { nativeEvent: { url: string; code?: number } };
type LoadRequest = { url: string; isTopFrame?: boolean };

/**
 * Options for `useAuthenticatedWebView`.
 *
 * Pass your own WebView callbacks here instead of on `<WebView>`, so they don't replace the ones in
 * `webViewProps`. They receive the WebView's events for every page except Clerk's sign-in page, which
 * carries the one-time URL.
 */
export type UseAuthenticatedWebViewParams = {
  /**
   * Absolute URL on one of your instance's domains. It must use HTTPS outside development instances.
   * Changing it prepares a new transfer.
   */
  destination: string;
  onLoadStart?(event: LoadEvent): void;
  onLoadEnd?(event: LoadEndEvent): void;
  onHttpError?(event: LoadEvent): void;
  onError?(event: LoadEvent): void;
  /**
   * Return `false` to block a navigation. Clerk's sign-in page always loads.
   */
  onShouldStartLoadWithRequest?(request: LoadRequest): boolean;
};

type WebViewCallbacks = Omit<UseAuthenticatedWebViewParams, 'destination'>;

/**
 * Props to spread onto `<WebView>` from `react-native-webview`. They carry the one-time sign-in URL,
 * so never log or store them. Pass your own callbacks to `useAuthenticatedWebView` rather than setting
 * them on `<WebView>` after the spread.
 */
export type AuthenticatedWebViewProps = {
  source: { uri: string };
  onLoadStart: (event: LoadEvent) => void;
  onLoadEnd: (event: LoadEndEvent) => void;
  onHttpError: (event: LoadEvent) => void;
  onError: (event: LoadEvent) => void;
  onShouldStartLoadWithRequest: (request: LoadRequest) => boolean;
};

/**
 * The state of an authenticated WebView. Render the WebView whenever `webViewProps` is set, and keep
 * your loading overlay over it until `status` is `ready`.
 */
export type AuthenticatedWebView =
  | {
      /**
       * The sign-in URL is being prepared. There is nothing to render yet.
       */
      status: 'preparing';
      webViewProps: null;
      error: null;
      retry: () => void;
    }
  | {
      /**
       * The WebView is on Clerk's sign-in page. Render it under your overlay, because it has to load
       * to finish signing in.
       */
      status: 'loading';
      webViewProps: AuthenticatedWebViewProps;
      error: null;
      retry: () => void;
    }
  | {
      /**
       * The WebView left Clerk's sign-in page and finished loading the next page. This describes the
       * initial sign-in only. Later navigations don't change `status`, so it does not track whether the
       * web page stays signed in.
       */
      status: 'ready';
      webViewProps: AuthenticatedWebViewProps;
      error: null;
      retry: () => void;
    }
  | {
      /**
       * There is no active session in the app, or Clerk reported it signed out.
       */
      status: 'signed-out';
      webViewProps: null;
      error: null;
      retry: () => void;
    }
  | {
      /**
       * Preparing, loading, or redeeming the URL failed. Show your own error view in place of the
       * WebView, because the page it landed on is not signed in as the active user. `retry` prepares a new URL.
       */
      status: 'error';
      webViewProps: null;
      error: SessionTransferError;
      retry: () => void;
    };

type TransferState =
  | { phase: 'redeeming'; requestId: string; webViewProps: AuthenticatedWebViewProps }
  | { phase: 'ready'; requestId: string; webViewProps: AuthenticatedWebViewProps }
  | { phase: 'failed'; requestId: string; error: SessionTransferError };

type TransferResult =
  | { type: 'minted'; requestId: string; webViewProps: AuthenticatedWebViewProps }
  | { type: 'mint-failed'; requestId: string; error: SessionTransferError };

type TransferAction = TransferResult | { type: 'navigated'; requestId: string; verdict: NavigationVerdict };

function transferReducer(state: TransferState | null, action: TransferAction): TransferState | null {
  switch (action.type) {
    case 'minted':
      return { phase: 'redeeming', requestId: action.requestId, webViewProps: action.webViewProps };
    case 'mint-failed':
      return { phase: 'failed', requestId: action.requestId, error: action.error };
    case 'navigated':
      return state?.phase === 'redeeming' && state.requestId === action.requestId
        ? applyVerdict(state, action.verdict)
        : state;
  }
}

function applyVerdict(
  state: Extract<TransferState, { phase: 'redeeming' }>,
  verdict: NavigationVerdict,
): TransferState {
  switch (verdict.kind) {
    case 'pending':
      return state;
    case 'ready':
      return { ...state, phase: 'ready' };
    case 'failed':
      return {
        phase: 'failed',
        requestId: state.requestId,
        error: sessionTransferError(
          verdict.code,
          verdict.code === 'load_failed'
            ? 'The sign-in page failed to load.'
            : 'The web page could not sign the user in.',
        ),
      };
  }
}

/**
 * Prepares a one-time URL that signs the active user in on `destination`, and returns props for a
 * `react-native-webview` `<WebView>` that opens it. The URL is prepared when the hook mounts, so mount it
 * on the screen that shows the WebView. Remounts and React Strict Mode reuse a URL the WebView has not received yet.
 *
 * The WebView keeps its own cookies after the app user signs out. When the user signs out or another
 * user signs in, clear the WebView's cookies or mount the WebView with `incognito`. Otherwise the web
 * page still holds the previous user's session and the hook reports `other_user_signed_in`.
 *
 * @param params - The page to open, and your own WebView callbacks.
 * @returns The WebView state, its props, and a `retry` function.
 *
 * @example
 * ### Show a signed-in web page under a loading overlay
 * ```tsx
 * import { useAuthenticatedWebView } from '@clerk/expo/native-to-web';
 * import { Redirect } from 'expo-router';
 * import { View } from 'react-native';
 * import { WebView } from 'react-native-webview';
 *
 * export default function BillingScreen() {
 *   const web = useAuthenticatedWebView({ destination: 'https://app.example.com/billing' });
 *
 *   if (web.status === 'signed-out') return <Redirect href='/sign-in' />;
 *   if (web.status === 'error') return <ErrorView onRetry={web.retry} />;
 *
 *   return (
 *     <View style={{ flex: 1 }}>
 *       {web.webViewProps && <WebView {...web.webViewProps} style={{ flex: 1 }} />}
 *       {web.status !== 'ready' && <LoadingOverlay />}
 *     </View>
 *   );
 * }
 * ```
 *
 * @example
 * ### Open links to other sites in the browser
 * ```tsx
 * const web = useAuthenticatedWebView({
 *   destination: 'https://app.example.com/billing',
 *   onShouldStartLoadWithRequest: ({ url }) => {
 *     if (new URL(url).origin === 'https://app.example.com') return true;
 *     void Linking.openURL(url);
 *     return false;
 *   },
 * });
 * ```
 */
export function useAuthenticatedWebView({
  destination,
  ...callbacks
}: UseAuthenticatedWebViewParams): AuthenticatedWebView {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const latestCallbacks = useRef<WebViewCallbacks>(callbacks);
  useLayoutEffect(() => {
    latestCallbacks.current = callbacks;
  });
  const [attempt, setAttempt] = useState(0);
  const [state, dispatch] = useReducer(transferReducer, null);
  const settledRequestId = useRef<string | null>(null);
  // Counts target changes, so returning to an earlier destination never matches its consumed result.
  const target = `${sessionId}\n${destination}`;
  const [activation, setActivation] = useState({ target, count: 0 });
  if (activation.target !== target) {
    setActivation({ target, count: activation.count + 1 });
  }
  const requestId = isLoaded && isSignedIn && sessionId ? `${target}\n${activation.count}\n${attempt}` : null;

  useEffect(() => {
    if (!requestId || settledRequestId.current === requestId) {
      return;
    }

    let attached = true;
    const settle = (result: TransferResult) => {
      if (attached) {
        settledRequestId.current = requestId;
        dispatch(result);
      }
    };
    const fail = (error: unknown) => settle({ type: 'mint-failed', requestId, error: toSessionTransferError(error) });

    let request: TransferRequest;
    try {
      request = resolveTransferRequest({ destination, presentation: 'webview' });
    } catch (error) {
      fail(error);
      return;
    }

    const present = (lease: TransferLease) => {
      lease.transfer.then(transfer => {
        if (!attached) {
          return;
        }
        if (claimTransfer(lease)) {
          settle({
            type: 'minted',
            requestId,
            webViewProps: createWebViewProps(requestId, transfer, dispatch, latestCallbacks),
          });
        } else {
          present(acquireTransfer(request));
        }
      }, fail);
    };
    present(acquireTransfer(request, { fresh: attempt > 0 }));

    return () => {
      attached = false;
    };
  }, [requestId, destination, attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  if (!isLoaded) {
    return { status: 'preparing', webViewProps: null, error: null, retry };
  }
  if (!isSignedIn) {
    return { status: 'signed-out', webViewProps: null, error: null, retry };
  }

  const current = state?.requestId === requestId ? state : null;
  switch (current?.phase) {
    case undefined:
      return { status: 'preparing', webViewProps: null, error: null, retry };
    case 'redeeming':
      return { status: 'loading', webViewProps: current.webViewProps, error: null, retry };
    case 'ready':
      return { status: 'ready', webViewProps: current.webViewProps, error: null, retry };
    case 'failed':
      return current.error.code === 'signed_out'
        ? { status: 'signed-out', webViewProps: null, error: null, retry }
        : { status: 'error', webViewProps: null, error: current.error, retry };
  }
}

function createWebViewProps(
  requestId: string,
  transfer: SessionTransfer,
  dispatch: Dispatch<TransferAction>,
  callbacks: { readonly current: WebViewCallbacks },
): AuthenticatedWebViewProps {
  const judge = (event: NavigationEvent) =>
    dispatch({ type: 'navigated', requestId, verdict: judgeNavigation(transfer.url, event) });
  const isSignInPage = (url: string) => isRedeemPageUrl(transfer.url, url);

  return {
    source: { uri: transfer.url },
    onLoadStart: event => {
      judge({ kind: 'load-start', url: event.nativeEvent.url });
      if (!isSignInPage(event.nativeEvent.url)) {
        callbacks.current.onLoadStart?.(event);
      }
    },
    onLoadEnd: event => {
      judge({ kind: 'load-end', url: event.nativeEvent.url, failed: typeof event.nativeEvent.code === 'number' });
      if (!isSignInPage(event.nativeEvent.url)) {
        callbacks.current.onLoadEnd?.(event);
      }
    },
    onHttpError: event => {
      judge({ kind: 'http-error', url: event.nativeEvent.url });
      if (!isSignInPage(event.nativeEvent.url)) {
        callbacks.current.onHttpError?.(event);
      }
    },
    onError: event => {
      judge({ kind: 'load-end', url: event.nativeEvent.url, failed: true });
      if (!isSignInPage(event.nativeEvent.url)) {
        callbacks.current.onError?.(event);
      }
    },
    onShouldStartLoadWithRequest: request => {
      // react-native-webview sets isTopFrame only on iOS. A load-start verdict can report a redeem
      // failure but never ready, so judging an Android frame's request can only err toward an error.
      if (request.isTopFrame !== false) {
        judge({ kind: 'load-start', url: request.url });
      }
      if (isSignInPage(request.url)) {
        return true;
      }
      return callbacks.current.onShouldStartLoadWithRequest?.(request) ?? true;
    },
  };
}
