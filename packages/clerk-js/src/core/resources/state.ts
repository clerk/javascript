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
 * Resource actions for the Zustand store
 */
export type ResourceAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: ClerkAPIErrorJSON }
  | { type: 'RESET' };

/**
 * Resource store shape using Zustand slices pattern
 */
export type ResourceStore<T> = {
  resource: {
    status: 'idle' | 'loading' | 'error' | 'success';
    data: T | null;
    error: ClerkAPIErrorJSON | null;
    dispatch: (action: ResourceAction<T>) => void;
    getData: () => T | null;
    getError: () => ClerkAPIErrorJSON | null;
    hasError: () => boolean;
    getStatus: () => 'idle' | 'loading' | 'error' | 'success';
  };
};

/**
 * Creates a resource slice following the Zustand slices pattern.
 * This slice handles generic resource state management (loading, success, error states).
 * All resource state is namespaced under the 'resource' key and flattened (no nested 'state' object).
 */
const createResourceSlice = <T>(set: any, get: any): ResourceStore<T> => {
  const dispatch = (action: ResourceAction<T>) => {
    set((state: any) => {
      let newResourceState;

      switch (action.type) {
        case 'FETCH_START':
          newResourceState = {
            status: 'loading' as const,
            data: state.resource.data, // Keep existing data during loading
            error: null,
          };
          break;
        case 'FETCH_SUCCESS':
          newResourceState = {
            status: 'success' as const,
            data: action.data,
            error: null,
          };
          break;
        case 'FETCH_ERROR':
          newResourceState = {
            status: 'error' as const,
            data: state.resource.data, // Keep existing data on error
            error: action.error,
          };
          break;
        case 'RESET':
          newResourceState = {
            status: 'idle' as const,
            data: null,
            error: null,
          };
          break;
        default:
          return state;
      }

      return {
        ...state,
        resource: {
          ...state.resource,
          ...newResourceState,
        },
      };
    });
  };

  return {
    resource: {
      status: 'idle' as const,
      data: null,
      error: null,
      dispatch,
      getData: () => {
        const state = get();
        return state.resource.data;
      },
      getError: () => {
        const state = get();
        return state.resource.error;
      },
      hasError: () => {
        const state = get();
        return state.resource.status === 'error';
      },
      getStatus: () => {
        const state = get();
        return state.resource.status;
      },
    },
  };
};

/**
 * Creates a basic resource store using just the resource slice.
 * This is used by BaseResource for backward compatibility.
 */
export const createResourceStore = <T>(name = 'ResourceStore') => {
  return createStore<ResourceStore<T>>()(
    devtools(
      (set, get) => ({
        ...createResourceSlice<T>(set, get),
      }),
      { name },
    ),
  );
};

export { createResourceSlice };
