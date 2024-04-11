import { describe } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import { clearFetchCache, useFetch } from '../useFetch';

describe('useFetch', () => {
  beforeEach(() => {
    clearFetchCache(); // Clear cache before each test
  });

  it('useFetch should fetch data successfully', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ name: 'org1' });
    const { result } = renderHook(() => useFetch(mockFetcher, 'someParams'));

    await waitFor(() => expect(result.current.data).toStrictEqual({ name: 'org1' }));

    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(mockFetcher).toHaveBeenCalledWith('someParams');
  });

  it('useFetch should use cached data when available', async () => {
    const mockFetcher = jest.fn().mockResolvedValueOnce({ data: 'initial data' });
    const { result } = renderHook(() => useFetch(mockFetcher, 'someParams'));

    await waitFor(() => expect(result.current.data).toStrictEqual({ data: 'initial data' }));

    // Subsequent calls should use cached data
    const { result: cachedResult } = renderHook(() => useFetch(mockFetcher, 'someParams'));
    expect(cachedResult.current.data).toStrictEqual({ data: 'initial data' });
    expect(mockFetcher).toHaveBeenCalledTimes(1); // Fetcher called only once
  });

  it('useFetch should handle fetch errors', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useFetch(mockFetcher, 'someParams'));

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('useFetch should handle loading state transitions correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ name: 'org1' });
    const { result } = renderHook(() => useFetch(mockFetcher, 'someParams'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
