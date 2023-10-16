import { useEffect, useRef } from 'react';

import { useLoadingStatus } from './useLoadingStatus';
import { useSafeState } from './useSafeState';

export const useFetch = <T>(
  fetcher: ((...args: any) => Promise<T>) | undefined,
  params: any,
  callbacks?: {
    onSuccess?: (data: T) => void;
  },
) => {
  const [data, setData] = useSafeState<T | null>(null);
  const requestStatus = useLoadingStatus({
    status: 'loading',
  });

  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    if (!fetcherRef.current) {
      return;
    }
    requestStatus.setLoading();
    fetcherRef
      .current(params)
      .then(result => {
        requestStatus.setIdle();
        if (typeof result !== 'undefined') {
          setData(typeof result === 'object' ? { ...result } : result);
          callbacks?.onSuccess?.(typeof result === 'object' ? { ...result } : result);
        }
      })
      .catch(() => {
        requestStatus.setError();
        setData(null);
      });
  }, []);

  return {
    status: requestStatus,
    data,
  };
};
