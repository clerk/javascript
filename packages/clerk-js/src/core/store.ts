/**
 * Factory-based Store implementation for managing typed state with subscriptions.
 * Provides a reactive state management pattern with immutable updates.
 */

export type StoreKey = string & { readonly __storeKeyBrand: unique symbol };
export type StoreListener<TState> = (state: TState) => void;
export type StateDeriver<TState> = (baseState: Partial<TState>) => TState;

export interface StoreOptions<TState> {
  /**
   * Function to derive the complete state from partial updates
   */
  deriveState: StateDeriver<TState>;
  /**
   * Default state to return when no state exists for a key
   */
  defaultState: TState;
}

export interface Store<TKey extends StoreKey, TState> {
  /**
   * Gets the current state for a key, returning default state if none exists
   */
  getState(key: TKey): TState;

  /**
   * Updates the state for a key with partial updates
   */
  setState(key: TKey, updates: Partial<TState>): void;

  /**
   * Clears the state for a key and notifies listeners
   */
  clearState(key: TKey): void;

  /**
   * Subscribes to state changes for a specific key
   * @returns Unsubscribe function
   */
  subscribe(key: TKey, listener: StoreListener<TState>): () => void;

  /**
   * Adds a pending operation for a key
   */
  addPendingOperation(key: TKey, operationId: string): void;

  /**
   * Removes a pending operation for a key
   */
  removePendingOperation(key: TKey, operationId: string): void;

  /**
   * Checks if there are any pending operations for a key
   */
  hasPendingOperations(key: TKey): boolean;

  /**
   * Gets the count of pending operations for a key
   */
  getPendingOperationsCount(key: TKey): number;
}

/**
 * Factory function to create a typed store with reactive state management.
 * Each store maintains state, listeners, and pending operations for multiple keys.
 */
export function createStore<TKey extends StoreKey, TState>(options: StoreOptions<TState>): Store<TKey, TState> {
  const cache = new Map<TKey, TState>();
  const listeners = new Map<TKey, Set<StoreListener<TState>>>();
  const pendingOperations = new Map<TKey, Set<string>>();
  const { deriveState, defaultState } = options;

  const frozenDefaultState = Object.freeze(defaultState);

  /**
   * Safely gets or creates a Set for a map entry
   */
  function safeGetSet<K, V>(map: Map<K, Set<V>>, key: K): Set<V> {
    if (!map.has(key)) {
      map.set(key, new Set<V>());
    }
    const result = map.get(key);
    if (!result) {
      throw new Error('Expected set to exist after creation');
    }
    return result;
  }

  /**
   * Notifies all listeners for a key about state changes
   */
  function notifyListeners(key: TKey, state: TState): void {
    const keyListeners = listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          // Log error but don't break other listeners
          console.error('Store listener error:', error);
        }
      });
    }
  }

  return {
    getState(key: TKey): TState {
      return cache.get(key) || frozenDefaultState;
    },

    setState(key: TKey, updates: Partial<TState>): void {
      const currentState = cache.get(key) || frozenDefaultState;
      const baseState = { ...currentState, ...updates };
      const newState = Object.freeze(deriveState(baseState as Partial<TState>));

      cache.set(key, newState);
      notifyListeners(key, newState);
    },

    clearState(key: TKey): void {
      cache.delete(key);
      notifyListeners(key, frozenDefaultState);
    },

    subscribe(key: TKey, listener: StoreListener<TState>): () => void {
      const keyListeners = safeGetSet(listeners, key);
      keyListeners.add(listener);

      return () => {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          listeners.delete(key);
        }
      };
    },

    addPendingOperation(key: TKey, operationId: string): void {
      const operations = safeGetSet(pendingOperations, key);
      operations.add(operationId);
    },

    removePendingOperation(key: TKey, operationId: string): void {
      const operations = pendingOperations.get(key);
      if (operations) {
        operations.delete(operationId);
        if (operations.size === 0) {
          pendingOperations.delete(key);
        }
      }
    },

    hasPendingOperations(key: TKey): boolean {
      const operations = pendingOperations.get(key);
      return Boolean(operations && operations.size > 0);
    },

    getPendingOperationsCount(key: TKey): number {
      const operations = pendingOperations.get(key);
      return operations ? operations.size : 0;
    },
  };
}

/**
 * Factory function to create a typed store key
 */
export function createStoreKey<T extends string>(key: T): StoreKey {
  return key as unknown as StoreKey;
}

/**
 * Utility type for extracting state type from store options
 */
export type InferStoreState<T> = T extends StoreOptions<infer U> ? U : never;
