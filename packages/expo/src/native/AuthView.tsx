import { type ReactElement, useCallback } from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { getNativeClerkView } from '../specs/nativeView';
import { isNativeSupported } from '../utils/native-module';
import type { AuthViewProps } from './AuthView.types';

type AuthEvent = Readonly<{ type: string }>;
type AuthNativeEvent = Readonly<{ nativeEvent: AuthEvent }>;

interface NativeAuthViewProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  onAuthEvent?: (event: AuthNativeEvent) => void;
}

const NativeClerkAuthView = getNativeClerkView<NativeAuthViewProps>('ClerkAuthView');

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
export function AuthView({ mode = 'signInOrUp', isDismissible = true, onDismiss }: AuthViewProps): ReactElement {
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
            : 'Native AuthView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkAuthView
      style={{ flex: 1 }}
      mode={mode}
      isDismissible={isDismissible}
      onAuthEvent={handleAuthEvent}
    />
  );
}
