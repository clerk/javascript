/**
 * Prewired expo-router screens for Clerk's native components.
 *
 * These wrap {@link UserProfileView} and {@link AuthView} in hosted-navigation mode so they
 * can be pushed onto an expo-router stack with a single header: the route header shows a
 * working back button while the user is inside Clerk's internal screens, the iOS back
 * gesture and Android hardware/predictive back do the right thing, and the route pops
 * automatically when the flow ends (sign-out, account deletion, auth completion).
 *
 * Requires `expo-router` to be installed. This module is intentionally a separate entry
 * point (`@clerk/expo/native/router`) so apps not using expo-router never load it.
 *
 * @module @clerk/expo/native/router
 */
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { AuthView } from './AuthView';
import type { AuthViewProps } from './AuthView.types';
import type { HostedNavigationRef, HostedNavigationState } from './HostedNavigation.types';
import type { UserProfileViewProps } from './UserProfileView';
import { UserProfileView } from './UserProfileView';

interface ExpoRouterModule {
  Stack: ComponentType<{ children?: ReactNode }> & {
    Screen: ComponentType<{ options?: Record<string, unknown> }>;
  };
  useRouter: () => { back: () => void };
  useFocusEffect: (effect: () => undefined | (() => void)) => void;
}

interface NavigationElementsModule {
  HeaderBackButton: ComponentType<{ onPress?: () => void }>;
}

function loadExpoRouter(): ExpoRouterModule {
  try {
    // Load via synchronous require() so expo-router stays an optional peer:
    // apps not using this entry point never resolve it.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-router') as ExpoRouterModule;
  } catch {
    throw new Error(
      '@clerk/expo/native/router requires expo-router to be installed. ' +
        'Install expo-router, or use UserProfileView / AuthView with hideHeader directly.',
    );
  }
}

function loadHeaderBackButton(): NavigationElementsModule['HeaderBackButton'] {
  // @react-navigation/elements is a dependency of expo-router's native stack.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('@react-navigation/elements') as NavigationElementsModule).HeaderBackButton;
}

interface HostedScreenState {
  navigationState: HostedNavigationState;
  onNavigationChange: (state: HostedNavigationState) => void;
  componentRef: React.RefObject<HostedNavigationRef>;
  screenOptions: Record<string, unknown>;
  handleDismiss: () => void;
}

function useHostedScreen(
  router: ExpoRouterModule,
  onDismiss: (() => void) | undefined,
  extraOptions: Record<string, unknown> | undefined,
): HostedScreenState {
  const { useRouter, useFocusEffect } = router;
  const routerHandle = useRouter();
  const componentRef = useRef<HostedNavigationRef>(null);
  const isFocused = useRef(false);
  const [navigationState, setNavigationState] = useState<HostedNavigationState>({ depth: 0, canGoBack: false });
  const HeaderBackButton = useRef(loadHeaderBackButton()).current;

  // Pop the route when the flow ends, but only while this screen is focused —
  // the same event also fires when the native view unmounts after a route pop.
  const handleDismiss = useCallback(() => {
    if (!isFocused.current) {
      return;
    }
    routerHandle.back();
    onDismiss?.();
  }, [onDismiss, routerHandle]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (navigationState.canGoBack) {
          void componentRef.current?.goBack();
          return true;
        }
        return false;
      });
      return () => {
        isFocused.current = false;
        subscription.remove();
      };
    }, [navigationState.canGoBack]),
  );

  const screenOptions: Record<string, unknown> = {
    // At the component's root, the route's own back button and gestures behave
    // normally. Deeper in, back must pop Clerk's internal stack first.
    headerBackVisible: !navigationState.canGoBack,
    gestureEnabled: !navigationState.canGoBack,
    headerLeft: navigationState.canGoBack
      ? () => <HeaderBackButton onPress={() => void componentRef.current?.goBack()} />
      : undefined,
    ...extraOptions,
  };

  return { navigationState, onNavigationChange: setNavigationState, componentRef, screenOptions, handleDismiss };
}

/**
 * Props for {@link UserProfileScreen}.
 */
export interface UserProfileScreenProps extends Pick<UserProfileViewProps, 'onDismiss' | 'style'> {
  /**
   * Extra options merged into the screen's `Stack.Screen` options (e.g. `title`).
   * Keys managed by the screen (`headerBackVisible`, `gestureEnabled`, `headerLeft`)
   * are overridden at your own risk.
   */
  options?: Record<string, unknown>;
}

/**
 * A drop-in expo-router screen rendering {@link UserProfileView} under the route's own header.
 *
 * @example
 * ```tsx
 * // app/(app)/account.tsx
 * import { UserProfileScreen } from '@clerk/expo/native/router';
 *
 * export default function AccountScreen() {
 *   return <UserProfileScreen options={{ title: 'Account' }} />;
 * }
 * ```
 */
export function UserProfileScreen({ onDismiss, style, options }: UserProfileScreenProps): ReactElement {
  const router = useRef(loadExpoRouter()).current;
  const { Stack } = router;
  const { onNavigationChange, componentRef, screenOptions, handleDismiss } = useHostedScreen(
    router,
    onDismiss,
    options,
  );

  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  useEffect(() => {
    // Sign-out and account deletion end the profile flow; leave the route.
    if (isSignedIn === false) {
      handleDismiss();
    }
  }, [isSignedIn, handleDismiss]);

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <UserProfileView
        ref={componentRef}
        hideHeader
        isDismissible={false}
        style={style ?? { flex: 1 }}
        onNavigationChange={onNavigationChange}
        onDismiss={handleDismiss}
      />
    </>
  );
}

/**
 * Props for {@link AuthScreen}.
 */
export interface AuthScreenProps extends Pick<AuthViewProps, 'mode' | 'onDismiss'> {
  /**
   * Extra options merged into the screen's `Stack.Screen` options (e.g. `title`).
   * Keys managed by the screen (`headerBackVisible`, `gestureEnabled`, `headerLeft`)
   * are overridden at your own risk.
   */
  options?: Record<string, unknown>;
}

/**
 * A drop-in expo-router screen rendering {@link AuthView} under the route's own header.
 *
 * @example
 * ```tsx
 * // app/sign-in.tsx
 * import { AuthScreen } from '@clerk/expo/native/router';
 *
 * export default function SignInScreen() {
 *   return <AuthScreen options={{ title: 'Sign in' }} />;
 * }
 * ```
 */
export function AuthScreen({ mode, onDismiss, options }: AuthScreenProps): ReactElement {
  const router = useRef(loadExpoRouter()).current;
  const { Stack } = router;
  const { onNavigationChange, componentRef, screenOptions, handleDismiss } = useHostedScreen(
    router,
    onDismiss,
    options,
  );

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <AuthView
        ref={componentRef}
        mode={mode}
        hideHeader
        isDismissible={false}
        onNavigationChange={onNavigationChange}
        onDismiss={handleDismiss}
      />
    </>
  );
}
