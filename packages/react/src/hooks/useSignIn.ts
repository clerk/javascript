import { ClerkInstanceContext, useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignInResource } from '@clerk/types';
import { useCallback,useContext, useMemo } from 'react';
import { useStore } from 'zustand';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type QueuedCall = {
  target: 'signIn' | 'setActive';
  method: string;
  args: any[];
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

/**
 * Enhanced SignInResource with observable capabilities for React.
 */
type ObservableSignInResource = SignInResource & {
  /**
   * The observable store state. This is not a function but the actual state.
   * Components using this should access it directly from the useSignIn hook result.
   */
  observableState?: any;
};

/**
 * Return type for the useSignIn hook
 */
type UseSignInReturn = {
  isLoaded: boolean;
  signIn: ObservableSignInResource;
  setActive: SetActive;
  /**
   * The observable store state. Use this to access the SignIn store state.
   * This value will trigger re-renders when the store state changes.
   */
  signInStore: any;
};

/**
 * A stable fallback store that maintains consistent behavior when no real store exists.
 */
const FALLBACK_STATE = {};
const FALLBACK_STORE = {
  getState: () => FALLBACK_STATE,
  subscribe: () => () => {}, // Return unsubscribe function
  setState: () => {},
  destroy: () => {}
};

export const useSignIn = (): UseSignInReturn => {
  // Check if ClerkProvider context is available first
  const clerkInstanceContext = useContext(ClerkInstanceContext);
  
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  // Only assert ClerkProvider if we have some context - this allows proxy fallback
  if (clerkInstanceContext) {
    useAssertWrappedByClerkProvider('useSignIn');
  }

  isomorphicClerk?.telemetry?.record(eventMethodCalled('useSignIn'));

  // Get the store reference - this must be done at the top level
  const store = useMemo(() => {
    if (!client?.signIn) return FALLBACK_STORE;
    
    // Try both 'store' and '_store' properties, but default to fallback
    return (client.signIn as any).store || (client.signIn as any)._store || FALLBACK_STORE;
  }, [client?.signIn]);

  // Always call useStore at the top level with a consistent store reference
  const storeState = useStore(store);

  // Determine if we have a real store
  const hasRealStore = store !== FALLBACK_STORE;

  // Compute the final store state
  const signInStore = useMemo(() => {
    if (!hasRealStore) {
      return {};
    }
    return storeState;
  }, [hasRealStore, storeState]);

  const callQueue: QueuedCall[] = [];

  const processQueue = useCallback((signIn: SignInResource, setActive: SetActive) => {
    while (callQueue.length > 0) {
      const queuedCall = callQueue.shift();
      if (!queuedCall) continue;

      const { target, method, args, resolve, reject } = queuedCall;
      try {
        const targetObj = target === 'setActive' ? setActive : signIn;
        const result = (targetObj as any)[method](...args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }, []);

  const createProxy = useCallback(<T>(target: 'signIn' | 'setActive'): T => {
    const proxyTarget: any = {};
    
    return new Proxy(
      proxyTarget,
      {
        get(_, prop) {
          // Prevent React from treating this proxy as a Promise by returning undefined for 'then'
          if (prop === 'then') {
            return undefined;
          }
          
          // Handle Symbol properties and other non-method properties
          if (typeof prop === 'symbol' || typeof prop !== 'string') {
            return undefined;
          }

          // For observableState property, return undefined in proxy mode
          if (prop === 'observableState' && target === 'signIn') {
            return undefined;
          }

          return (...args: any[]) => {
            return new Promise((resolve, reject) => {
              callQueue.push({
                target,
                method: String(prop),
                args,
                resolve,
                reject,
              });
            });
          };
        },
        has(_, prop) {
          // Return false for 'then' to prevent Promise-like behavior
          if (prop === 'then') {
            return false;
          }
          // Return true for all other properties to indicate they exist on the proxy
          return true;
        },
        ownKeys(_) {
          return Object.getOwnPropertyNames(proxyTarget);
        },
        getOwnPropertyDescriptor(_, prop) {
          return Object.getOwnPropertyDescriptor(proxyTarget, prop);
        }
      },
    ) as T;
  }, []);

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => {
    if (client) {
      processQueue(client.signIn, isomorphicClerk.setActive);

      // Create an enhanced signIn object that includes the observable state
      const enhancedSignIn: ObservableSignInResource = Object.create(client.signIn);
      Object.defineProperty(enhancedSignIn, 'observableState', {
        value: signInStore,
        writable: false,
        enumerable: true,
        configurable: true
      });

      return {
        isLoaded: true,
        signIn: enhancedSignIn,
        setActive: isomorphicClerk.setActive,
        signInStore,
      };
    }

    return {
      isLoaded: true,
      signIn: createProxy<ObservableSignInResource>('signIn'),
      setActive: createProxy<SetActive>('setActive'),
      signInStore: {},
    };
  }, [client, isomorphicClerk?.setActive, signInStore, processQueue, createProxy]);
};