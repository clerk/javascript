import type { QueryClient } from './query-core';

type TaggedQueryClient = { __tag: 'clerk-rq-client'; client: QueryClient };

class LazyQueryController {
  #queryClient: QueryClient | undefined;
  #requested = false;
  static #instance: LazyQueryController | undefined;

  static get(): LazyQueryController {
    if (!this.#instance) {
      this.#instance = new LazyQueryController();
    }
    return this.#instance;
  }

  constructor() {}

  get client(): TaggedQueryClient | undefined {
    if (!this.#requested) {
      void import('./query-core')
        .then(module => module.QueryClient)
        .then(QueryClient => {
          if (this.#queryClient) {
            return;
          }
          this.#queryClient = new QueryClient();
          // @ts-expect-error - queryClientStatus is not typed
          this.#publicEventBus.emit('queryClientStatus', 'ready');
        });
    }

    return this.#queryClient
      ? {
          __tag: 'clerk-rq-client',
          client: this.#queryClient,
        }
      : undefined;
  }

  invalidate(...params: Parameters<QueryClient['invalidateQueries']>): void {
    // Only invalidate if the query client exists
    this.#queryClient?.invalidateQueries(...params);
  }
}

export const lazyQueryController = LazyQueryController.get();
