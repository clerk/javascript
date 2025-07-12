import type { ClerkPaginatedResponse, ClerkResource } from '@clerk/types';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import type { PagesOrInfiniteOptions, PaginatedHookConfig, PaginatedResources } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @internal
 */
type CommerceHookConfig<TResource extends ClerkResource, TParams extends PagesOrInfiniteOptions> = {
  hookName: string;
  resourceType: string;
  useFetcher: (
    param: 'organization' | 'user',
  ) => ((params: TParams) => Promise<ClerkPaginatedResponse<TResource>>) | undefined;
};

/**
 * A hook factory that creates paginated data fetching hooks for commerce-related resources.
 * It provides a standardized way to create hooks that can fetch either user or organization resources
 * with built-in pagination support.
 *
 * The generated hooks handle:
 * - Clerk authentication context
 * - Resource-specific data fetching
 * - Pagination (both traditional and infinite scroll)
 * - Telemetry tracking
 * - Type safety for the specific resource.
 *
 * @internal
 */
export function createCommerceHook<TResource extends ClerkResource, TParams extends PagesOrInfiniteOptions>({
  hookName,
  resourceType,
  useFetcher,
}: CommerceHookConfig<TResource, TParams>) {
  type HookParams = PaginatedHookConfig<PagesOrInfiniteOptions> & {
    for: 'organization' | 'user';
  };

  return function useCommerceHook<T extends HookParams>(
    params: T,
  ): PaginatedResources<TResource, T extends { infinite: true } ? true : false> {
    const { for: _for, ...paginationParams } = params;

    useAssertWrappedByClerkProvider(hookName);

    const fetchFn = useFetcher(_for);

    const safeValues = useWithSafeValues(paginationParams, {
      initialPage: 1,
      pageSize: 10,
      keepPreviousData: false,
      infinite: false,
      __experimental_mode: undefined,
    } as unknown as T);

    const clerk = useClerkInstanceContext();
    const user = useUserContext();
    const { organization } = useOrganizationContext();

    clerk.telemetry?.record(eventMethodCalled(hookName));

    const hookParams =
      typeof paginationParams === 'undefined'
        ? undefined
        : ({
            initialPage: safeValues.initialPage,
            pageSize: safeValues.pageSize,
            ...(_for === 'organization' ? { orgId: organization?.id } : {}),
          } as TParams);

    const isClerkLoaded = !!(clerk.loaded && user);

    const isEnabled = !!hookParams && isClerkLoaded;

    const result = usePagesOrInfinite<TParams, ClerkPaginatedResponse<TResource>>(
      (hookParams || {}) as TParams,
      fetchFn,
      {
        keepPreviousData: safeValues.keepPreviousData,
        infinite: safeValues.infinite,
        enabled: isEnabled,
        __experimental_mode: safeValues.__experimental_mode,
      },
      {
        type: resourceType,
        userId: user?.id,
        ...(_for === 'organization' ? { orgId: organization?.id } : {}),
      },
    );

    return result;
  };
}
