import { noop } from './noop';

type Callback = (val?: any) => void;

/**
 * Create a promise that can be resolved or rejected from
 * outside the Promise constructor callback
 */
export const createDeferredPromise = () => {
  let resolve: Callback = noop;
  let reject: Callback = noop;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
