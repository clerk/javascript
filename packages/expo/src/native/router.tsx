/**
 * Prewired expo-router screens for Clerk's native components.
 *
 * These wrap {@link UserProfileView} and {@link AuthView} in embedded-navigation mode so they
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
import type { EmbeddedNavigationRef, EmbeddedNavigationState } from './EmbeddedNavigation.types';
import type { UserProfileViewProps } from './UserProfileView';
import { UserProfileView } from './UserProfileView';

interface ExpoRouterModule {
  Stack: ComponentType<{ children?: ReactNode }> & {
    Screen: ComponentType<{ options?: Record<string, unknown> }>;
  };
  useRouter: () => { back: () => void };
  useFocusEffect: (effect: () => undefined | (() => void)) => void;
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

interface ReactNavigationModule {
  usePreventRemove: (preventRemove: boolean, callback: () => void) => void;
}

function loadReactNavigation(): ReactNavigationModule {
  // Newer expo-router versions vendor react-navigation; older setups resolve
  // @react-navigation/native directly (it ships with expo-router's stack).
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const vendored = require('expo-router/react-navigation') as Partial<ReactNavigationModule>;
    if (vendored.usePreventRemove) {
      return vendored as ReactNavigationModule;
    }
  } catch {
    // Fall through to @react-navigation/native.
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-navigation/native') as ReactNavigationModule;
  } catch {
    throw new Error(
      '@clerk/expo/native/router could not resolve usePreventRemove from expo-router/react-navigation ' +
        'or @react-navigation/native. Ensure expo-router is installed.',
    );
  }
}

interface EmbeddedScreenState {
  navigationState: EmbeddedNavigationState;
  onNavigationChange: (state: EmbeddedNavigationState) => void;
  componentRef: React.RefObject<EmbeddedNavigationRef>;
  screenOptions: Record<string, unknown>;
  handleDismiss: () => void;
}

function useEmbeddedScreen(
  router: ExpoRouterModule,
  onDismiss: (() => void) | undefined,
  extraOptions: Record<string, unknown> | undefined,
): EmbeddedScreenState {
  const { useRouter, useFocusEffect } = router;
  const { usePreventRemove } = useRef(loadReactNavigation()).current;
  const routerHandle = useRouter();
  const componentRef = useRef<EmbeddedNavigationRef>(null);
  const isFocused = useRef(false);
  const hasDismissed = useRef(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [navigationState, setNavigationState] = useState<EmbeddedNavigationState>({ depth: 0, canGoBack: false });

  // Pop the route when the flow ends, but only while this screen is focused —
  // the same event also fires when the native view unmounts after a route pop.
  // Flow-end can be reported by more than one source (native event, auth-state
  // change); the ref makes sure the route is only popped once. The pop itself
  // is deferred a frame so removal interception is disarmed before it runs.
  const handleDismiss = useCallback(() => {
    if (!isFocused.current || hasDismissed.current) {
      return;
    }
    hasDismissed.current = true;
    setIsDismissing(true);
    setTimeout(() => {
      routerHandle.back();
      onDismiss?.();
    }, 300);
  }, [onDismiss, routerHandle]);

  const onNavigationChange = useCallback((state: EmbeddedNavigationState) => {
    if (hasDismissed.current) {
      return;
    }
    setNavigationState(state);
  }, []);

  // The route keeps its regular native back button at every depth. While the
  // user is inside Clerk's internal screens, removal (back press, gesture,
  // hardware back) is intercepted and pops Clerk's stack instead.
  usePreventRemove(navigationState.canGoBack && !isDismissing, () => {
    void componentRef.current?.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      hasDismissed.current = false;
      setIsDismissing(false);
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

  const screenOptions: Record<string, unknown> = { ...extraOptions };

  return { navigationState, onNavigationChange, componentRef, screenOptions, handleDismiss };
}

/**
 * Props for {@link UserProfileScreen}.
 */
export interface UserProfileScreenProps extends Pick<UserProfileViewProps, 'onDismiss' | 'style'> {
  /**
   * Extra options merged into the screen's `Stack.Screen` options (e.g. `title`).
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
  const { onNavigationChange, componentRef, screenOptions, handleDismiss } = useEmbeddedScreen(
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
  const { onNavigationChange, componentRef, screenOptions, handleDismiss } = useEmbeddedScreen(
    router,
    onDismiss,
    options,
  );

  // The native view only reports dismissal for dismissible presentations, so
  // completion is detected from auth state: a session becoming active (or the
  // active session changing, for add-account flows) means the flow finished.
  const { sessionId } = useAuth();
  const initialSessionId = useRef(sessionId);
  useEffect(() => {
    if (sessionId && sessionId !== initialSessionId.current) {
      handleDismiss();
    }
  }, [sessionId, handleDismiss]);

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
