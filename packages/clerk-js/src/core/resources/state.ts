import type { ClerkAPIErrorJSON } from '@clerk/types';
import { devtools } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

/**
 * Represents the possible states of a resource.
 */
export type ResourceState<T> =
  | { type: 'idle'; data: null; error: null }
  | { type: 'loading'; data: null; error: null }
  | { type: 'error'; data: null; error: ClerkAPIErrorJSON | null }
  | { type: 'success'; data: T; error: null };

/**
 * Represents the actions that can be dispatched to change the resource state.
 */
export type ResourceAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: ClerkAPIErrorJSON | null }
  | { type: 'RESET' };

/**
 * Represents the store interface for a resource.
 */
export type ResourceStore<T> = {
  /** The current state of the resource */
  state: ResourceState<T>;
  /** Dispatches an action to change the resource state */
  dispatch: (action: ResourceAction<T>) => void;
  /** Returns whether the resource can be fetched (idle or error state) */
  canFetch: () => boolean;
  /** Returns the current data of the resource, or null if not in success state */
  getData: () => T | null;
  /** Returns the current error of the resource, or null if not in error state */
  getError: () => ClerkAPIErrorJSON | null;
  /** Returns whether the resource has encountered an error */
  hasError: () => boolean;
  /** Returns whether the resource is currently loading */
  isLoading: () => boolean;
};

/**
 * Creates selectors for accessing resource state.
 * @returns An object containing selector functions
 */
const createSelectors = <T>() => ({
  canFetch: (state: ResourceState<T>): boolean => state.type === 'idle' || state.type === 'error',
  getData: (state: ResourceState<T>): T | null => (state.type === 'success' ? state.data : null),
  getError: (state: ResourceState<T>): ClerkAPIErrorJSON | null => (state.type === 'error' ? state.error : null),
  hasError: (state: ResourceState<T>): boolean => state.type === 'error',
  isLoading: (state: ResourceState<T>): boolean => state.type === 'loading',
});

/**
 * Creates a new resource store with state management capabilities.
 * @returns A Zustand store instance with resource state management
 */
export const createResourceStore = <T>() => {
  const selectors = createSelectors<T>();

  return createStore<ResourceStore<T>>()(
    devtools(
      (set, get) => ({
        state: { type: 'idle', data: null, error: null },
        dispatch: action => {
          switch (action.type) {
            case 'FETCH_START':
              set({ state: { type: 'loading', data: null, error: null } });
              break;
            case 'FETCH_SUCCESS':
              set({ state: { type: 'success', data: action.data, error: null } });
              break;
            case 'FETCH_ERROR':
              set({ state: { type: 'error', data: null, error: action.error } });
              break;
            case 'RESET':
              set({ state: { type: 'idle', data: null, error: null } });
              break;
          }
        },
        canFetch: () => selectors.canFetch(get().state),
        getData: () => selectors.getData(get().state),
        getError: () => selectors.getError(get().state),
        hasError: () => selectors.hasError(get().state),
        isLoading: () => selectors.isLoading(get().state),
      }),
      { name: 'ResourceStore' },
    ),
  );
};
