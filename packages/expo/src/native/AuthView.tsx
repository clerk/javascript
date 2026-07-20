import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { Text, View } from 'react-native';

import type { NativeClerkAuthViewRef } from '../specs/NativeClerkAuthView';
import NativeClerkAuthView from '../specs/NativeClerkAuthView';
import { isNativeSupported } from '../utils/native-module';
import type { AuthViewProps } from './AuthView.types';
import type { HostedNavigationRef, HostedNavigationState } from './HostedNavigation.types';

type AuthNativeEvent = NativeSyntheticEvent<Readonly<{ type: string }>>;

/**
 * Imperative handle exposed by {@link AuthView}.
 */
export type AuthViewRef = HostedNavigationRef;

/**
 * A pre-built native authentication component that handles sign-in and sign-up flows.
 *
 * `AuthView` renders inline within your React Native view hierarchy, powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * After authentication completes, the session is automatically synced with the JS SDK.
 * Use `useAuth()`, `useUser()`, or `useSession()` to react to authentication
 * state changes.
 *
 * To push the auth flow onto your own navigation stack with a single header, enable
 * `hideHeader` and drive back navigation through the component ref — or, with
 * expo-router, use the prewired screen from `@clerk/expo/native/router`.
 *
 * @example
 * ```tsx
 * import { AuthView } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function SignInScreen() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (isSignedIn) router.replace('/home');
 *   }, [isSignedIn]);
 *
 *   return <AuthView />;
 * }
 * ```
 *
 * @see {@link https://clerk.com/docs/components/authentication/sign-in} Clerk Sign-In Documentation
 */
export const AuthView = forwardRef<AuthViewRef, AuthViewProps>(function AuthView(
  { mode = 'signInOrUp', isDismissible = true, logoMaxHeight, hideHeader = false, onDismiss, onNavigationChange },
  ref,
) {
  const nativeRef = useRef<NativeClerkAuthViewRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      goBack: () => nativeRef.current?.goBack() ?? Promise.resolve(),
      popToRoot: () => nativeRef.current?.popToRoot() ?? Promise.resolve(),
    }),
    [],
  );
  const handleAuthEvent = useCallback(
    (event: AuthNativeEvent) => {
      if (event.nativeEvent.type === 'dismissed') {
        onDismiss?.();
      }
    },
    [onDismiss],
  );

  const handleNavigationChange = useCallback(
    (event: NativeSyntheticEvent<HostedNavigationState>) => {
      const { depth, canGoBack } = event.nativeEvent;
      onNavigationChange?.({ depth, canGoBack });
    },
    [onNavigationChange],
  );

  if (!isNativeSupported || !NativeClerkAuthView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          {!isNativeSupported
            ? 'Native AuthView is only available on iOS and Android'
            : 'Native AuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      ref={nativeRef}
      style={{ flex: 1 }}
      mode={mode}
      isDismissible={isDismissible}
      logoMaxHeight={logoMaxHeight}
      hideHeader={hideHeader}
      onAuthEvent={handleAuthEvent}
      onNavigationChange={hideHeader ? handleNavigationChange : undefined}
    />
  );
});
