import type { ClerkAPIErrorJSON } from '@clerk/types';
import { devtools } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

/**
 * Represents the possible states of a resource.
 */
export type ResourceState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: ClerkAPIErrorJSON | null }
  | { status: 'success'; data: T; error: null };

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
  state: ResourceState<T>;
  dispatch: (action: ResourceAction<T>) => void;
  getData: () => T | null;
  getError: () => ClerkAPIErrorJSON | null;
  hasError: () => boolean;
  status: () => 'idle' | 'loading' | 'error' | 'success';
};

/**
 * Creates selectors for accessing resource state.
 * @returns An object containing selector functions
 */
const createSelectors = <T>() => ({
  getData: (state: ResourceState<T>): T | null => (state.status === 'success' ? state.data : null),
  getError: (state: ResourceState<T>): ClerkAPIErrorJSON | null => (state.status === 'error' ? state.error : null),
  hasError: (state: ResourceState<T>): boolean => state.status === 'error',
  getStatus: (state: ResourceState<T>): 'idle' | 'loading' | 'error' | 'success' => state.status,
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
              set({ state: { status: 'loading', data: null, error: null } });
              break;
            case 'FETCH_SUCCESS':
              set({ state: { status: 'success', data: action.data, error: null } });
              break;
            case 'FETCH_ERROR':
              set({ state: { status: 'error', data: null, error: action.error } });
              break;
            case 'RESET':
              set({ state: { status: 'idle', data: null, error: null } });
              break;
          }
        },
        getData: () => selectors.getData(get().state),
        getError: () => selectors.getError(get().state),
        hasError: () => selectors.hasError(get().state),
        status: () => selectors.getStatus(get().state),
      }),
      { name: 'ResourceStore' },
    ),
  );
};
