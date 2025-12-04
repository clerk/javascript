import { useSafeState } from './useSafeState';

type Status = 'idle' | 'loading' | 'error';

export const useLoadingStatus = <Metadata>(initialState?: { status: Status; metadata?: Metadata | undefined }) => {
  const [state, setState] = useSafeState<{ status: Status; metadata?: Metadata | undefined }>({
    status: 'idle',
    metadata: undefined,
    ...initialState,
  });

  return {
    status: state.status,
    setIdle: (metadata?: Metadata) => setState({ status: 'idle', metadata }),
    setError: (metadata?: Metadata) => setState({ status: 'error', metadata }),
    setLoading: (metadata?: Metadata) => setState({ status: 'loading', metadata }),
    loadingMetadata: state.status === 'loading' ? state.metadata : undefined,
    isLoading: state.status === 'loading',
    isIdle: state.status === 'idle',
  };
};
