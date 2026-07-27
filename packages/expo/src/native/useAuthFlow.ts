import { useEffect, useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import type { NativeAuthFlowState } from '../specs/NativeClerkModule.types';
import { ClerkExpoModule as ClerkExpo } from '../utils/native-module';

const nativeAuthFlowChangedEvent = 'clerkNativeAuthFlowChanged';

export type UseAuthFlowReturn = NativeAuthFlowState;

type NativeAuthFlowEventEmitter = {
  addListener(
    eventName: typeof nativeAuthFlowChangedEvent,
    listener: (state?: NativeAuthFlowState) => void,
  ): { remove: () => void };
  getAuthFlowState(): Promise<NativeAuthFlowState>;
};

const initialNativeState: NativeAuthFlowState = {
  isLoaded: false,
  isAuthFlowComplete: false,
};

function getNativeAuthFlowModule(): NativeAuthFlowEventEmitter | null {
  if (ClerkExpo && typeof ClerkExpo.addListener === 'function' && typeof ClerkExpo.getAuthFlowState === 'function') {
    return ClerkExpo as NativeAuthFlowEventEmitter;
  }

  return null;
}

function isNativeAuthFlowState(state: NativeAuthFlowState | undefined): state is NativeAuthFlowState {
  return typeof state?.isLoaded === 'boolean' && typeof state.isAuthFlowComplete === 'boolean';
}

/**
 * Reports when authentication and Clerk-owned post-authentication steps are complete.
 *
 * Use this hook to choose between a non-dismissible root `AuthView` and the
 * application's authenticated content. On platforms without native auth-flow
 * completion state, it falls back to the JS session state.
 */
export function useAuthFlow(): UseAuthFlowReturn {
  const { isLoaded: isJsLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const [nativeState, setNativeState] = useState(initialNativeState);
  const [useJsFallback, setUseJsFallback] = useState(false);
  const nativeModule = getNativeAuthFlowModule();

  useEffect(() => {
    if (!nativeModule) {
      setUseJsFallback(true);
      return;
    }

    let isMounted = true;
    let didReceiveEvent = false;
    let subscription: { remove: () => void } | undefined;

    setUseJsFallback(false);

    try {
      subscription = nativeModule.addListener(nativeAuthFlowChangedEvent, state => {
        if (!isNativeAuthFlowState(state)) {
          return;
        }

        didReceiveEvent = true;
        setNativeState(state);
      });

      void nativeModule
        .getAuthFlowState()
        .then(state => {
          if (isMounted && !didReceiveEvent && isNativeAuthFlowState(state)) {
            setNativeState(state);
          }
        })
        .catch(error => {
          if (!isMounted) {
            return;
          }

          setUseJsFallback(true);
          if (__DEV__) {
            console.error('[useAuthFlow] Failed to get native auth-flow state:', error);
          }
        });
    } catch (error) {
      setUseJsFallback(true);
      if (__DEV__) {
        console.error('[useAuthFlow] Failed to observe native auth-flow state:', error);
      }
    }

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [nativeModule]);

  if (!nativeModule || useJsFallback) {
    return {
      isLoaded: isJsLoaded,
      isAuthFlowComplete: Boolean(isJsLoaded && isSignedIn),
    };
  }

  return {
    isLoaded: Boolean(isJsLoaded && nativeState.isLoaded),
    isAuthFlowComplete: Boolean(isJsLoaded && isSignedIn && nativeState.isAuthFlowComplete),
  };
}
