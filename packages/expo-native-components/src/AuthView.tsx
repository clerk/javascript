import { useCallback } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { Text, View } from 'react-native';

import type { AuthViewProps } from './AuthView.types';
import NativeClerkAuthView from './specs/NativeClerkAuthView';
import { isNativeSupported } from './utils/native-module';

type AuthNativeEvent = NativeSyntheticEvent<Readonly<{ type: string }>>;

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
 * To push the auth flow onto your own navigation stack, hide the route's header and
 * pass `onHostBack` so Clerk's own chrome takes over.
 *
 * @example
 * ```tsx
 * import { AuthView } from '@clerk/expo-native-components';
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
export function AuthView({
  logo,
  mode = 'signInOrUp',
  isDismissible = true,
  logoMaxHeight,
  onDismiss,
  onHostBack,
}: AuthViewProps) {
  const handleAuthEvent = useCallback(
    (event: AuthNativeEvent) => {
      if (event.nativeEvent.type === 'dismissed') {
        onDismiss?.();
      }
    },
    [onDismiss],
  );

  if (!isNativeSupported || !NativeClerkAuthView) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          {!isNativeSupported
            ? 'Native AuthView is only available on iOS and Android'
            : 'Native AuthView requires a development build with the @clerk/expo-native-components config plugin. Add "@clerk/expo-native-components" to your app.json plugins array and rebuild your native app.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      style={{ flex: 1 }}
      mode={mode}
      isDismissible={isDismissible}
      logoMaxHeight={logoMaxHeight}
      hostBackButton={!!onHostBack}
      onAuthEvent={handleAuthEvent}
      onHostBack={onHostBack ? () => onHostBack() : undefined}
    >
      {logo ? (
        <View
          collapsable={false}
          style={{ alignSelf: 'flex-start' }}
        >
          {logo}
        </View>
      ) : null}
    </NativeClerkAuthView>
  );
}
