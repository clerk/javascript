import React from 'react';

type Status = 'idle' | 'loading' | 'error';

export const useLoadingStatus = <Metadata>() => {
  const [state, setState] = React.useState<{ status: Status; metadata?: Metadata | undefined }>({
    status: 'idle',
    metadata: undefined,
  });

  return {
    status: state.status,
    setIdle: (metadata?: Metadata) => setState({ status: 'idle', metadata }),
    setError: (metadata?: Metadata) => setState({ status: 'error', metadata }),
    setLoading: (metadata?: Metadata) => setState({ status: 'loading', metadata }),
    loadingMetadata: state.status === 'loading' ? state.metadata : undefined,
    idleMetadata: state.status === 'idle' ? state.metadata : undefined,
    errorMetadata: state.status === 'error' ? state.metadata : undefined,
    isLoading: state.status === 'loading',
    isIdle: state.status === 'idle',
  };
};
