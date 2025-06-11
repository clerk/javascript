import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignInResource } from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type QueuedCall = {
  target: 'signIn' | 'setActive';
  method: string;
  args: any[];
  resolve: (value: any) => void;
  reject: (error: any) => void;
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
      signIn: client.signIn,
      setActive: isomorphicClerk.setActive,
    };
  }

  const createProxy = <T>(target: 'signIn' | 'setActive'): T => {
    return new Proxy(
      {},
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
    signIn: createProxy<SignInResource>('signIn'),
    setActive: createProxy<SetActive>('setActive'),
  };
};
