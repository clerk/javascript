import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { APIKeyResource, GetAPIKeysParams } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { STABLE_KEYS } from '../stable-keys';
import type { PaginatedHookConfig, PaginatedResources } from '../types';
import { createCacheKeys } from './createCacheKeys';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @interface
 */
export type UseAPIKeysParams = PaginatedHookConfig<
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
export type UseAPIKeysReturn<T extends UseAPIKeysParams> = PaginatedResources<
  APIKeyResource,
  T extends { infinite: true } ? true : false
>;

/**
 * The `useAPIKeys()` hook provides access to paginated API keys for the current user or organization.
 *
 * @example
 * ### Basic usage with default pagination
 *
 * ```tsx
 * const { data, isLoading, page, pageCount, fetchNext, fetchPrevious } = useAPIKeys({
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
 * const { data, isLoading } = useAPIKeys({
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
 * const { data, isLoading, fetchNext, hasNextPage } = useAPIKeys({
 *   subject: 'user_123',
 *   infinite: true,
 * });
 * ```
 */
export function useAPIKeys<T extends UseAPIKeysParams>(params?: T): UseAPIKeysReturn<T> {
  useAssertWrappedByClerkProvider('useAPIKeys');

  const safeValues = useWithSafeValues(params, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    subject: '',
    query: '',
    enabled: true,
  } as UseAPIKeysParams);

  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled('useAPIKeys'));

  const hookParams: GetAPIKeysParams = {
    initialPage: safeValues.initialPage,
    pageSize: safeValues.pageSize,
    ...(safeValues.subject ? { subject: safeValues.subject } : {}),
    ...(safeValues.query ? { query: safeValues.query } : {}),
  };

  const isEnabled = (safeValues.enabled ?? true) && clerk.loaded;

  const result = usePagesOrInfinite({
    fetcher: clerk.apiKeys?.getAll
      ? (params: GetAPIKeysParams) => clerk.apiKeys.getAll({ ...params, subject: safeValues.subject })
      : undefined,
    config: {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      enabled: isEnabled,
      isSignedIn: Boolean(clerk.user),
      initialPage: safeValues.initialPage,
      pageSize: safeValues.pageSize,
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.API_KEYS_KEY,
      authenticated: Boolean(clerk.user),
      tracked: {
        subject: safeValues.subject,
      },
      untracked: {
        args: hookParams,
      },
    }),
  }) as UseAPIKeysReturn<T>;

  const { mutate } = useSWRConfig();

  // Invalidate all cache entries for this user or organization
  const invalidateAll = useCallback(() => {
    return mutate(key => {
      if (!key || typeof key !== 'object') {
        return false;
      }
      // Match all apiKeys cache entries for this user or organization, regardless of page, pageSize, or query
      return 'type' in key && key.type === 'apiKeys' && 'subject' in key && key.subject === safeValues.subject;
    });
  }, [mutate, safeValues.subject]);

  return {
    ...result,
    revalidate: invalidateAll as any,
  };
}
