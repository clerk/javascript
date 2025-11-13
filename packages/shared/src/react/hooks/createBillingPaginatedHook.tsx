import { eventMethodCalled } from '../../telemetry/events/method-called';
import type { ClerkPaginatedResponse, ClerkResource, EnvironmentResource, ForPayerType } from '../../types';
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
type BillingHookConfig<TResource extends ClerkResource, TParams extends PagesOrInfiniteOptions> = {
  hookName: string;
  resourceType: string;
  useFetcher: (
    param: ForPayerType,
  ) => ((params: TParams & { orgId?: string }) => Promise<ClerkPaginatedResponse<TResource>>) | undefined;
  options?: {
    unauthenticated?: boolean;
  };
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
export function createBillingPaginatedHook<TResource extends ClerkResource, TParams extends PagesOrInfiniteOptions>({
  hookName,
  resourceType,
  useFetcher,
  options,
}: BillingHookConfig<TResource, TParams>) {
  type HookParams = PaginatedHookConfig<
    PagesOrInfiniteOptions & {
      /**
       * If `true`, a request will be triggered when the hook is mounted.
       *
       * @default true
       */
      enabled?: boolean;
    }
  > & {
    for?: ForPayerType;
  };

  return function useBillingHook<T extends HookParams>(
    params?: T,
  ): PaginatedResources<TResource, T extends { infinite: true } ? true : false> {
    const { for: _for, enabled: externalEnabled, ...paginationParams } = params || ({} as Partial<T>);

    const safeFor = _for || 'user';

    useAssertWrappedByClerkProvider(hookName);

    const fetchFn = useFetcher(safeFor);

    const safeValues = useWithSafeValues(paginationParams, {
      initialPage: 1,
      pageSize: 10,
      keepPreviousData: false,
      infinite: false,
      __experimental_mode: undefined,
    } as unknown as T);

    const clerk = useClerkInstanceContext();

    // @ts-expect-error `__unstable__environment` is not typed
    const environment = clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;
    const user = useUserContext();
    const { organization } = useOrganizationContext();

    clerk.telemetry?.record(eventMethodCalled(hookName));

    const isForOrganization = safeFor === 'organization';

    const hookParams =
      typeof paginationParams === 'undefined'
        ? undefined
        : ({
            initialPage: safeValues.initialPage,
            pageSize: safeValues.pageSize,
            ...(options?.unauthenticated ? {} : isForOrganization ? { orgId: organization?.id } : {}),
          } as TParams);

    const billingEnabled = isForOrganization
      ? environment?.commerceSettings.billing.organization.enabled
      : environment?.commerceSettings.billing.user.enabled;

    const isEnabled = !!hookParams && clerk.loaded && !!billingEnabled && (externalEnabled ?? true);

    const result = usePagesOrInfinite<TParams, ClerkPaginatedResponse<TResource>>(
      (hookParams || {}) as TParams,
      fetchFn,
      {
        keepPreviousData: safeValues.keepPreviousData,
        infinite: safeValues.infinite,
        enabled: isEnabled,
        ...(options?.unauthenticated ? {} : { isSignedIn: Boolean(user) }),
        __experimental_mode: safeValues.__experimental_mode,
      },
      {
        type: resourceType,
        ...(options?.unauthenticated
          ? { for: safeFor }
          : {
              userId: user?.id,
              ...(isForOrganization ? { orgId: organization?.id } : {}),
            }),
      },
    );

    return result;
  };
}
