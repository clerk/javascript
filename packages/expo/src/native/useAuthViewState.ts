import { useEffect, useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import type { NativeAuthFlowState } from '../specs/NativeClerkModule.types';
import { ClerkExpoModule as ClerkExpo } from '../utils/native-module';

const nativeAuthFlowChangedEvent = 'clerkNativeAuthFlowChanged';

export type UseAuthViewStateReturn = NativeAuthFlowState;

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
 * Reports when authentication and an optional trusted-device enrollment prompt are complete.
 *
 * Use this hook when trusted-device enrollment prompts are enabled and a
 * non-dismissible root `AuthView` must remain mounted until the prompt finishes.
 * On platforms without native auth-flow completion state, it falls back to the
 * JS session state.
 */
export function useAuthViewState(): UseAuthViewStateReturn {
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
        setUseJsFallback(false);
      });

      void nativeModule
        .getAuthFlowState()
        .then(state => {
          if (!isMounted || didReceiveEvent) {
            return;
          }

          if (isNativeAuthFlowState(state)) {
            setNativeState(state);
          } else {
            setUseJsFallback(true);
          }
        })
        .catch(error => {
          if (!isMounted || didReceiveEvent) {
            return;
          }

          setUseJsFallback(true);
          if (__DEV__) {
            console.error('[useAuthViewState] Failed to get native auth-flow state:', error);
          }
        });
    } catch (error) {
      setUseJsFallback(true);
      if (__DEV__) {
        console.error('[useAuthViewState] Failed to observe native auth-flow state:', error);
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
