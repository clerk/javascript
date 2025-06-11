import { ClerkInstanceContext,useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignInResource } from '@clerk/types';
import { useContext } from 'react';
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
 * This implementation is SSR-safe and prevents hydration mismatches.
 */
const createStoreObservable = (signInResource: SignInResource) => {
  return () => {
    const store = (signInResource as any).store;
    
    if (!store) {
      // Return empty state if store is not available
      return {};
    }

    // During SSR, return the current state without subscribing
    // This prevents hydration mismatches
    if (typeof window === 'undefined') {
      return store.getState();
    }

    // On client, use Zustand's built-in React integration
    return useStore(store);
  };
};

/**
 * Wraps a SignInResource with observable capabilities for React.
 */
const wrapSignInWithObservable = (signIn: SignInResource): ObservableSignInResource => {
  const observable = createStoreObservable(signIn);
  
  // Create a new object that extends the signIn resource with the observable method
  const wrappedSignIn = Object.create(signIn);
  
  // Add the observable method directly to the object
  Object.defineProperty(wrappedSignIn, 'observable', {
    value: observable,
    writable: false,
    enumerable: true,
    configurable: false
  });
  
  // Also use a Proxy to ensure all other properties are properly forwarded
  return new Proxy(wrappedSignIn, {
    get(target, prop) {
      if (prop === 'observable') {
        return observable;
      }
      // Forward to the original signIn object for all other properties
      return (target)[prop] ?? (signIn as any)[prop];
    },
    has(target, prop) {
      if (prop === 'observable') {
        return true;
      }
      return prop in target || prop in signIn;
    },
    ownKeys(target) {
      // Include 'observable' in the list of own keys
      const keys = [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertyNames(signIn)];
      if (!keys.includes('observable')) {
        keys.push('observable');
      }
      return keys;
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === 'observable') {
        return {
          value: observable,
          writable: false,
          enumerable: true,
          configurable: false
        };
      }
      return Object.getOwnPropertyDescriptor(target, prop) || Object.getOwnPropertyDescriptor(signIn, prop);
    }
  }) as ObservableSignInResource;
};

export const useSignIn = () => {
  // Check if ClerkProvider context is available first
  const clerkInstanceContext = useContext(ClerkInstanceContext);
  
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  // Only assert ClerkProvider if we have some context - this allows proxy fallback
  if (clerkInstanceContext) {
    useAssertWrappedByClerkProvider('useSignIn');
  }

  isomorphicClerk?.telemetry?.record(eventMethodCalled('useSignIn'));

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
      signIn: wrapSignInWithObservable(client.signIn),
      setActive: isomorphicClerk.setActive,
    };
  }

  const createProxy = <T>(target: 'signIn' | 'setActive'): T => {
    const proxyTarget = target === 'signIn' ? { observable: () => ({}) } : {};
    
    return new Proxy(
      proxyTarget,
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
                // Re-check context when the queued call executes
                const currentClient = useClientContext();
                const currentIsomorphicClerk = useIsomorphicClerkContext();
                if (currentClient) {
                  processQueue(currentClient.signIn, currentIsomorphicClerk.setActive);
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
        ownKeys(_) {
          // For signIn proxy, include 'observable' in enumerable keys
          if (target === 'signIn') {
            return ['observable'];
          }
          return [];
        },
        getOwnPropertyDescriptor(_, prop) {
          if (prop === 'observable' && target === 'signIn') {
            return {
              value: () => ({}),
              writable: false,
              enumerable: true,
              configurable: false
            };
          }
          return undefined;
        }
      },
    ) as T;
  };

  return {
    isLoaded: true,
    signIn: createProxy<ObservableSignInResource>('signIn'),
    setActive: createProxy<SetActive>('setActive'),
  };
};
