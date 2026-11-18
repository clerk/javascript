import type * as AuthSession from 'expo-auth-session';
import type * as WebBrowser from 'expo-web-browser';

import { errorThrower } from '../utils/errors';

export function loadSSODependencies(): {
  AuthSession: typeof AuthSession;
  WebBrowser: typeof WebBrowser;
} {
  // Load via synchronous require() instead of import(): Metro inlines require() into the main
  // bundle, while import() emits an async chunk that fails to resolve without @expo/metro-runtime.
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- type-only annotation for optional dependency
  let AuthSessionModule: typeof import('expo-auth-session');
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- type-only annotation for optional dependency
  let WebBrowserModule: typeof import('expo-web-browser');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    AuthSessionModule = require('expo-auth-session');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    WebBrowserModule = require('expo-web-browser');
  } catch (err) {
    return errorThrower.throw(
      `Unable to load expo-auth-session and expo-web-browser, which are required for SSO: ${
        err instanceof Error ? err.message : 'Unknown error'
      }. If they are not installed, run: npx expo install expo-auth-session expo-web-browser`,
    );
  }

  return {
    AuthSession: AuthSessionModule,
    WebBrowser: WebBrowserModule,
  };
}
