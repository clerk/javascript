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
      fetchOnMount: true,
    } as T);

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

    console.log('hookName', hookName);
    console.log('isEnabled', isEnabled);
    console.log('hookParams', hookParams);
    console.log('fn', fetchFn);

    const result = usePagesOrInfinite<TParams, ClerkPaginatedResponse<TResource>>(
      (hookParams || {}) as TParams,
      fetchFn,
      {
        keepPreviousData: safeValues.keepPreviousData,
        infinite: safeValues.infinite,
        fetchOnMount: safeValues.fetchOnMount,
        enabled: isEnabled,
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
