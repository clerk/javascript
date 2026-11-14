import type { ComponentProps } from 'react';
import type { WebView } from 'react-native-webview';
import type { AndroidWebViewProps, IOSWebViewProps } from 'react-native-webview/lib/WebViewTypes';
import { describe, expectTypeOf, test } from 'vitest';

import type { AuthenticatedWebViewProps } from '../useAuthenticatedWebView';

describe('AuthenticatedWebViewProps', () => {
  test('spreads onto the react-native-webview WebView', () => {
    expectTypeOf<AuthenticatedWebViewProps>().toExtend<Partial<ComponentProps<typeof WebView>>>();
  });

  test('fits the iOS and Android WebView props', () => {
    expectTypeOf<AuthenticatedWebViewProps>().toExtend<Partial<IOSWebViewProps>>();
    expectTypeOf<AuthenticatedWebViewProps>().toExtend<Partial<AndroidWebViewProps>>();
  });

  test('handles every WebView callback that reports a navigation', () => {
    expectTypeOf<keyof AuthenticatedWebViewProps>().toEqualTypeOf<
      'source' | 'onLoadStart' | 'onLoadEnd' | 'onHttpError' | 'onError' | 'onShouldStartLoadWithRequest'
    >();
  });

  test('rejects props the WebView would not accept', () => {
    expectTypeOf<{ source: { url: string } }>().not.toExtend<Partial<ComponentProps<typeof WebView>>>();
  });
});
