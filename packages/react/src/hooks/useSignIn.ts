import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignInResource } from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

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
   * A React hook that subscribes to the SignIn store and triggers re-renders
   * when the store state changes. This allows React components to reactively
   * respond to changes in the SignIn flow state.
   * 
   * @example
   * ```tsx
   * function MyComponent() {
   *   const { signIn } = useSignIn();
   *   const storeState = signIn.observable();
   *   
   *   // Re-renders when SignIn store state changes
   *   return (
   *     <div>
   *       <p>Status: {storeState.signin.status}</p>
   *       <p>Error: {storeState.signin.error.global}</p>
   *       <p>Resource Status: {storeState.resource.status}</p>
   *     </div>
   *   );
   * }
   * ```
   */
  observable: () => any;
};

/**
 * Creates a React hook that subscribes to a Zustand store and returns its state.
 * This enables React components to re-render when the store state changes.
 */
const createStoreObservable = (signInResource: SignInResource) => {
  return () => {
    const store = (signInResource as any).store;
    
    if (!store) {
      // Return empty state if store is not available
      return {};
    }

    const subscribe = useCallback(
      (callback: () => void) => {
        return store.subscribe(callback);
      },
      [store]
    );

    const getState = useCallback(() => {
      return store.getState();
    }, [store]);

    // Use React's useSyncExternalStore to subscribe to the Zustand store
    return useSyncExternalStore(subscribe, getState, getState);
  };
};

/**
 * Wraps a SignInResource with observable capabilities for React.
 */
const wrapSignInWithObservable = (signIn: SignInResource): ObservableSignInResource => {
  const observable = createStoreObservable(signIn);
  
  return new Proxy(signIn, {
    get(target, prop) {
      if (prop === 'observable') {
        return observable;
      }
      return (target as any)[prop];
    },
    has(target, prop) {
      if (prop === 'observable') {
        return true;
      }
      return prop in target;
    }
  }) as ObservableSignInResource;
};

export const useSignIn = () => {
  useAssertWrappedByClerkProvider('useSignIn');

  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  isomorphicClerk.telemetry?.record(eventMethodCalled('useSignIn'));

  const callQueue: QueuedCall[] = [];

  const processQueue = (signIn: SignInResource, setActive: SetActive) => {
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
  };

  if (client) {
    processQueue(client.signIn, isomorphicClerk.setActive);

    return {
      isLoaded: true,
      signIn: wrapSignInWithObservable(client.signIn) as ObservableSignInResource,
      setActive: isomorphicClerk.setActive,
    };
  }

  const createProxy = <T>(target: 'signIn' | 'setActive'): T => {
    return new Proxy(
      {},
      {
        get(_, prop) {
          // Handle the observable property for the proxy as well
          if (prop === 'observable') {
            return () => ({});
          }
          
          // Prevent React from treating this proxy as a Promise by returning undefined for 'then'
          if (prop === 'then') {
            return undefined;
          }
          
          // Handle Symbol properties and other non-method properties
          if (typeof prop === 'symbol' || typeof prop !== 'string') {
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

              setTimeout(() => {
                const currentClient = useClientContext();
                if (currentClient) {
                  processQueue(currentClient.signIn, isomorphicClerk.setActive);
                }
              }, 0);
            });
          };
        },
        has(_, prop) {
          // Return true for observable
          if (prop === 'observable') {
            return true;
          }
          // Return false for 'then' to prevent Promise-like behavior
          if (prop === 'then') {
            return false;
          }
          // Return true for all other properties to indicate they exist on the proxy
          return true;
        },
      },
    ) as T;
  };

  return {
    isLoaded: true,
    signIn: createProxy<ObservableSignInResource>('signIn'),
    setActive: createProxy<SetActive>('setActive'),
  };
};
