import type { ComponentProps } from 'react';
import type { WebView } from 'react-native-webview';
import { describe, expectTypeOf, test } from 'vitest';

import type { AuthenticatedWebViewProps, UseAuthenticatedWebViewParams } from '../useAuthenticatedWebView';

describe('AuthenticatedWebViewProps', () => {
  test('spreads onto the react-native-webview WebView', () => {
    expectTypeOf<AuthenticatedWebViewProps>().toExtend<Partial<ComponentProps<typeof WebView>>>();
  });

  test('types inline app callbacks with the full WebView events', () => {
    const params: UseAuthenticatedWebViewParams = {
      destination: 'https://app.example.com/account',
      onHttpError: event => expectTypeOf(event.nativeEvent.statusCode).toEqualTypeOf<number>(),
      onError: event => expectTypeOf(event.nativeEvent.description).toEqualTypeOf<string>(),
      onShouldStartLoadWithRequest: request => request.navigationType !== 'click',
    };
    expectTypeOf(params).toExtend<UseAuthenticatedWebViewParams>();
  });
});
