/**
 * Prewired expo-router screens for Clerk's native components.
 *
 * These wrap {@link UserProfileView} and {@link AuthView} so they can be pushed onto an
 * expo-router stack without compromise: the route's own header is hidden and the
 * component's native navigation chrome takes over, so titles, back buttons, gestures,
 * and transitions are all the platform's own. The component's root screen shows a back
 * button that pops the route, and the route pops automatically when the flow ends
 * (sign-out, account deletion, auth completion).
 *
 * Requires `expo-router` to be installed. This module is intentionally a separate entry
 * point (`@clerk/expo/native/router`) so apps not using expo-router never load it.
 *
 * @module @clerk/expo/native/router
 */
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useAuth } from '../hooks/useAuth';
import { AuthView } from './AuthView';
import type { AuthViewProps } from './AuthView.types';
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
        'Install expo-router, or use UserProfileView / AuthView with hostBackButton directly.',
    );
  }
}

const HIDDEN_HEADER_OPTIONS = { headerShown: false };

interface EmbeddedScreenState {
  handleDismiss: () => void;
  handleHostBack: () => void;
}

function useEmbeddedScreen(router: ExpoRouterModule, onDismiss: (() => void) | undefined): EmbeddedScreenState {
  const { useRouter, useFocusEffect } = router;
  const routerHandle = useRouter();
  const isFocused = useRef(false);
  const hasDismissed = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      hasDismissed.current = false;
      return () => {
        isFocused.current = false;
      };
    }, []),
  );

  // Pop the route when the flow ends, but only while this screen is focused —
  // the same event also fires when the native view unmounts after a route pop.
  // Flow-end can be reported by more than one source (native event, auth-state
  // change); the ref makes sure the route is only popped once.
  const handleDismiss = useCallback(() => {
    if (!isFocused.current || hasDismissed.current) {
      return;
    }
    hasDismissed.current = true;
    routerHandle.back();
    onDismiss?.();
  }, [onDismiss, routerHandle]);

  const handleHostBack = useCallback(() => {
    if (!isFocused.current || hasDismissed.current) {
      return;
    }
    hasDismissed.current = true;
    routerHandle.back();
  }, [routerHandle]);

  return { handleDismiss, handleHostBack };
}

/**
 * Props for {@link UserProfileScreen}.
 */
export type UserProfileScreenProps = Pick<UserProfileViewProps, 'onDismiss' | 'style'>;

/**
 * A drop-in expo-router screen rendering {@link UserProfileView} with its native
 * navigation chrome. The route's own header is hidden.
 *
 * @example
 * ```tsx
 * // app/(app)/account.tsx
 * import { UserProfileScreen } from '@clerk/expo/native/router';
 *
 * export default function AccountScreen() {
 *   return <UserProfileScreen />;
 * }
 * ```
 */
export function UserProfileScreen({ onDismiss, style }: UserProfileScreenProps): ReactElement {
  const router = useRef(loadExpoRouter()).current;
  const { Stack } = router;
  const { handleDismiss, handleHostBack } = useEmbeddedScreen(router, onDismiss);

  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  useEffect(() => {
    // Sign-out and account deletion end the profile flow; leave the route.
    if (isSignedIn === false) {
      handleDismiss();
    }
  }, [isSignedIn, handleDismiss]);

  return (
    <>
      <Stack.Screen options={HIDDEN_HEADER_OPTIONS} />
      <UserProfileView
        hostBackButton
        isDismissible={false}
        style={style ?? { flex: 1 }}
        onHostBack={handleHostBack}
        onDismiss={handleDismiss}
      />
    </>
  );
}

/**
 * Props for {@link AuthScreen}.
 */
export type AuthScreenProps = Pick<AuthViewProps, 'mode' | 'onDismiss'>;

/**
 * A drop-in expo-router screen rendering {@link AuthView} with its native
 * navigation chrome. The route's own header is hidden.
 *
 * @example
 * ```tsx
 * // app/sign-in.tsx
 * import { AuthScreen } from '@clerk/expo/native/router';
 *
 * export default function SignInScreen() {
 *   return <AuthScreen />;
 * }
 * ```
 */
export function AuthScreen({ mode, onDismiss }: AuthScreenProps): ReactElement {
  const router = useRef(loadExpoRouter()).current;
  const { Stack } = router;
  const { handleDismiss, handleHostBack } = useEmbeddedScreen(router, onDismiss);

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
      <Stack.Screen options={HIDDEN_HEADER_OPTIONS} />
      <AuthView
        mode={mode}
        hostBackButton
        isDismissible={false}
        onHostBack={handleHostBack}
        onDismiss={handleDismiss}
      />
    </>
  );
}
