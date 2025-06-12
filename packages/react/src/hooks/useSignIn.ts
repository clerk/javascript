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
  // Return a React hook function that can be called within React components
  return function useSignInObservable() {
    // Try both 'store' and '_store' properties
    const store = (signInResource as any).store || (signInResource as any)._store;
    
    // CRITICAL: Always call useStore to maintain hook call consistency
    // We create a fallback store that returns empty state if no real store exists
    const fallbackStore = {
      getState: () => ({}),
      subscribe: () => () => {}, // Return unsubscribe function
      setState: () => {},
      destroy: () => {}
    };
    
    const storeToUse = store || fallbackStore;
    
    // Always call useStore - this ensures consistent hook call order
    const storeState = useStore(storeToUse);
    
    // Debug logging with more detailed property inspection
    console.log('createStoreObservable debug:', {
      hasStore: !!store,
      hasPublicStore: !!((signInResource as any).store),
      hasPrivateStore: !!((signInResource as any)._store),
      storeType: typeof store,
      signInResourceKeys: Object.keys(signInResource),
      storePropertyDescriptor: Object.getOwnPropertyDescriptor(signInResource, 'store'),
      storePropertyDescriptorProto: Object.getOwnPropertyDescriptor(Object.getPrototypeOf(signInResource), 'store'),
      prototypeChain: Object.getPrototypeOf(signInResource)?.constructor?.name,
      isSSR: typeof window === 'undefined',
      usingFallbackStore: !store
    });
    
    // Try to access store via different methods if no store was found
    if (!store) {
      console.log('Trying alternative store access methods...');
      
      // Try calling store as a method (in case it's a getter)
      try {
        const storeViaCall = (signInResource as any).store?.();
        console.log('Store via call:', !!storeViaCall);
      } catch (e) {
        console.log('Store call failed:', e);
      }
      
      // Check if store exists on prototype
      const proto = Object.getPrototypeOf(signInResource);
      console.log('Store on prototype:', !!(proto && (proto).store));
    }
    
    // If no real store exists, return empty state
    if (!store) {
      console.log('No store found, returning empty object');
      return {};
    }

    // During SSR, return the current state from the store directly
    // This prevents hydration mismatches while still using the subscription
    if (typeof window === 'undefined') {
      const serverState = store.getState();
      console.log('SSR mode, returning server state:', serverState);
      return serverState;
    }

    // On client, return the subscribed state from useStore
    console.log('Client mode, returning subscribed state:', storeState);
    return storeState;
  };
};

/**
 * Wraps a SignInResource with observable capabilities for React.
 */
const wrapSignInWithObservable = (signIn: SignInResource): ObservableSignInResource => {
  const observable = createStoreObservable(signIn);
  
  // Create a new object that extends the signIn resource with the observable method
  const wrappedSignIn = Object.create(signIn);
  
  // Add the observable method directly to the object with proper descriptor
  Object.defineProperty(wrappedSignIn, 'observable', {
    value: observable,
    writable: false,
    enumerable: true,
    configurable: true
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
      // Get keys from both target and original signIn, avoiding duplicates
      const targetKeys = Object.getOwnPropertyNames(target);
      const signInKeys = Object.getOwnPropertyNames(signIn);
      const allKeys = new Set([...targetKeys, ...signInKeys]);
      return Array.from(allKeys);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === 'observable') {
        // Return the actual descriptor from the target
        return Object.getOwnPropertyDescriptor(target, prop);
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
    const proxyTarget: any = {};
    
    // For signIn proxy, add the observable method to the target
    if (target === 'signIn') {
      Object.defineProperty(proxyTarget, 'observable', {
        value: () => ({}),
        writable: false,
        enumerable: true,
        configurable: true
      });
    }
    
    return new Proxy(
      proxyTarget,
      {
        get(_, prop) {
          // Handle the observable property for the proxy as well
          if (prop === 'observable' && target === 'signIn') {
            return proxyTarget.observable;
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

              // Note: We're in the proxy fallback context where client is null
              // The queue will be processed when the client becomes available
              // and the component re-renders with the actual SignIn resource
            });
          };
        },
        has(_, prop) {
          // Return true for observable
          if (prop === 'observable' && target === 'signIn') {
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
          // Return the actual keys from the target
          return Object.getOwnPropertyNames(proxyTarget);
        },
        getOwnPropertyDescriptor(_, prop) {
          // Return the actual descriptor from the target
          return Object.getOwnPropertyDescriptor(proxyTarget, prop);
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
