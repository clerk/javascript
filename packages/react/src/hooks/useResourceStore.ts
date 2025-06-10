import { useStore } from 'zustand';
import type { createResourceStore } from '@clerk/clerk-js/src/core/resources/state';

/**
 * React hooks for using the resource store in React components.
 * This provides React-specific integration for the framework-agnostic resource store.
 */
export const createResourceStoreHooks = <T>(store: ReturnType<typeof createResourceStore<T>>) => {
  /**
   * Hook to get the entire store state
   */
  const useResourceStore = () => useStore(store);

  /**
   * Hook to get the current resource state
   */
  const useResourceState = () => useStore(store, state => state.state);

  /**
   * Hook to get the dispatch function
   */
  const useResourceDispatch = () => useStore(store, state => state.dispatch);

  /**
   * Hook to get the current data
   */
  const useResourceData = () => useStore(store, state => state.getData());

  /**
   * Hook to get the current error
   */
  const useResourceError = () => useStore(store, state => state.getError());

  /**
   * Hook to check if the resource is loading
   */
  const useResourceIsLoading = () => useStore(store, state => state.isLoading());

  /**
   * Hook to check if the resource has an error
   */
  const useResourceHasError = () => useStore(store, state => state.hasError());

  /**
   * Hook to check if the resource can be fetched
   */
  const useResourceCanFetch = () => useStore(store, state => state.canFetch());

  return {
    useResourceStore,
    useResourceState,
    useResourceDispatch,
    useResourceData,
    useResourceError,
    useResourceIsLoading,
    useResourceHasError,
    useResourceCanFetch,
  };
};
