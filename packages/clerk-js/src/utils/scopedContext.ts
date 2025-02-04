type ScopedContext<T> = {
  run<R>(context: T, fn: () => R): Promise<Awaited<R>>;
  get(): T | undefined;
};

function createScopedContext<T>(): ScopedContext<T> {
  const contextStack: T[] = [];

  return {
    async run<R>(context: T, fn: () => R): Promise<Awaited<R>> {
      contextStack.push(context);
      try {
        return await fn();
      } finally {
        contextStack.pop();
      }
    },
    get(): T | undefined {
      return contextStack[contextStack.length - 1];
    },
  };
}

export { createScopedContext };
export type { ScopedContext };
