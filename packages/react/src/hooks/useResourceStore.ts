import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';

interface ResourceStore<T> {
  state: any;
  dispatch: (action: any) => void;
  getData: () => T | null;
  getError: () => any;
  status: () => 'idle' | 'loading' | 'error' | 'success';
  hasError: () => boolean;
}

/**
 * React hooks for using the resource store in React components.
 * This provides React-specific integration for the framework-agnostic resource store.
 */
export const createResourceStoreHooks = <T>(store: StoreApi<ResourceStore<T>>) => {
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
  const useResourceData = () => useStore(store, state => state.state.data);

  /**
   * Hook to get the current error
   */
  const useResourceError = () => useStore(store, state => state.state.error);

  /**
   * Hook to get the current status
   */
  const useResourceStatus = () => useStore(store, state => state.state.status);

  /**
   * Hook to check if the resource has an error
   */
  const useResourceHasError = () => useStore(store, state => !!state.state.error);

  return {
    useResourceStore,
    useResourceState,
    useResourceDispatch,
    useResourceData,
    useResourceError,
    useResourceStatus,
    useResourceHasError,
  };
};
