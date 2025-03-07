function createStore(initialUsages: number) {
  let state = initialUsages;

  return {
    get: () => state > 0,
    increment: () => {
      state++;
    },
    decrease: () => {
      state = Math.max(state - 1, 0);
    },
  };
}

export const usageByUIComponents = createStore(0);

const isThenable = (value: unknown): value is Promise<unknown> => {
  return !!value && typeof (value as any).then === 'function';
};

export const makeUICaller = <T>(resource: T): T => {
  if (!resource) return null as T;
  const resourceProxy = new Proxy(resource, {
    get(target, prop) {
      // @ts-expect-error
      const value = target[prop];
      if (typeof value === 'function') {
        // @ts-expect-error
        return function (...args) {
          usageByUIComponents.increment();
          const result = value.apply(target, args);
          if (isThenable(result)) {
            return result.finally(() => usageByUIComponents.decrease());
          }
          usageByUIComponents.decrease();
          return result;
        };
      }

      // Allows for nested objects to be proxied (e.g. `client.signIn.create()`)
      if (typeof value === 'object') {
        return makeUICaller(value);
      }
      return value;
    },
  });
  return resourceProxy;
};
