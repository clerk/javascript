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
      .then(domain => {
        requestStatus.setIdle();
        if (domain) {
          setData({ ...domain });
          callbacks?.onSuccess?.({ ...domain });
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
