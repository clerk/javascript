'use client';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { APIKeyResource, GetAPIKeysParams } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import type { PaginatedHookConfig, PaginatedResources } from '../types';
import { createCacheKeys } from './createCacheKeys';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @interface
 */
export type UseApiKeysParams = PaginatedHookConfig<
  GetAPIKeysParams & {
    /**
     * If `true`, a request will be triggered when the hook is mounted.
     *
     * @default true
     */
    enabled?: boolean;
  }
>;

/**
 * @interface
 */
export type UseApiKeysReturn<T extends UseApiKeysParams> = PaginatedResources<
  APIKeyResource,
  T extends { infinite: true } ? true : false
>;

/**
 * The `useApiKeys()` hook provides access to paginated API keys for the current user or organization.
 *
 * @example
 * ### Basic usage with default pagination
 *
 * ```tsx
 * const { data, isLoading, page, pageCount, fetchNext, fetchPrevious } = useApiKeys({
 *   subject: 'user_123',
 *   pageSize: 10,
 *   initialPage: 1,
 * });
 * ```
 *
 * @example
 * ### With search query
 *
 * ```tsx
 * const [searchValue, setSearchValue] = useState('');
 * const debouncedSearch = useDebounce(searchValue, 500);
 *
 * const { data, isLoading } = useApiKeys({
 *   subject: 'user_123',
 *   query: debouncedSearch.trim(),
 *   pageSize: 10,
 * });
 * ```
 *
 * @example
 * ### Infinite scroll
 *
 * ```tsx
 * const { data, isLoading, fetchNext, hasNextPage } = useApiKeys({
 *   subject: 'user_123',
 *   infinite: true,
 * });
 * ```
 */
export function useApiKeys<T extends UseApiKeysParams>(params?: T): UseApiKeysReturn<T> {
  useAssertWrappedByClerkProvider('useApiKeys');

  const safeValues = useWithSafeValues(params, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    subject: '',
    query: '',
    enabled: true,
  } as UseApiKeysParams);

  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled('useApiKeys'));

  const hookParams: GetAPIKeysParams = {
    initialPage: safeValues.initialPage,
    pageSize: safeValues.pageSize,
    ...(safeValues.subject ? { subject: safeValues.subject } : {}),
    ...(safeValues.query ? { query: safeValues.query } : {}),
  };

  const isEnabled = (safeValues.enabled ?? true) && clerk.loaded;

  return usePagesOrInfinite({
    fetcher: clerk.apiKeys?.getAll ? (params: GetAPIKeysParams) => clerk.apiKeys.getAll(params) : undefined,
    config: {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      enabled: isEnabled,
      isSignedIn: Boolean(clerk.user),
      initialPage: safeValues.initialPage,
      pageSize: safeValues.pageSize,
    },
    keys: createCacheKeys({
      stablePrefix: 'apiKeys',
      authenticated: Boolean(clerk.user),
      tracked: {
        subject: safeValues.subject,
      },
      untracked: {
        args: hookParams,
      },
    }),
  }) as UseApiKeysReturn<T>;
}
