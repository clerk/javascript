/**
 * This function leverages JS Proxies to create an object that
 * can be used as a placeholder when you want to run a callback
 * but you don't have the necessary arguments ready yet.
 *
 * This proxy recursively returns itself so it can be passed safely
 * when you don't know how the caller will try to access it.
 *
 * Eg:
 * `const userCallback = (theme) => theme.prop1.prop2.prop3.replace();`
 *
 * Calling `userCallback` as follows is safe:
 * `userCallback(createInfiniteAccessProxy())`
 */
export const createInfiniteAccessProxy = () => {
  const get: ProxyHandler<any>['get'] = (_, prop) => {
    if (prop === Symbol.toPrimitive) {
      return () => '';
    } else if (prop in Object.getPrototypeOf('')) {
      return (args: unknown) => Object.getPrototypeOf('')[prop].call('', args);
    }
    return prop === Symbol.toPrimitive ? () => '' : proxy;
  };

  const proxy: any = new Proxy({}, { get });
  return proxy;
};
