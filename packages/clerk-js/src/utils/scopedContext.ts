type ScopedContext<T> = {
  run<R>(context: T, fn: () => R): Promise<Awaited<R>>;
  get(): T | undefined;
};

function createScopedContext<T>(): ScopedContext<T> {
  let currentContext: T | undefined;

  return {
    async run<R>(context: T, fn: () => R): Promise<Awaited<R>> {
      const previousContext = currentContext;
      currentContext = context;
      try {
        return await fn();
      } finally {
        currentContext = previousContext;
      }
    },
    get(): T | undefined {
      return currentContext;
    },
  };
}

export { createScopedContext };
export type { ScopedContext };
