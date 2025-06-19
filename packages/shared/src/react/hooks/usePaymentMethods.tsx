import type { ClerkPaginatedResponse, CommercePaymentSourceResource, GetPaymentSourcesParams } from '@clerk/types';

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
 * @interface
 */
export type UsePaymentMethodsParams = PaginatedHookConfig<PagesOrInfiniteOptions> & {
  for: 'organization' | 'user';
};

/**
 *
 */
export function usePaymentMethods<T extends UsePaymentMethodsParams>(
  params: T,
): PaginatedResources<CommercePaymentSourceResource, T extends { infinite: true } ? true : false> {
  const { for: _for, ...paginationParams } = params;

  useAssertWrappedByClerkProvider('usePaymentMethods');

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

  clerk.telemetry?.record(eventMethodCalled('usePaymentMethods'));

  const paymentMethodsParams =
    typeof paginationParams === 'undefined'
      ? undefined
      : {
          initialPage: safeValues.initialPage,
          pageSize: safeValues.pageSize,
          ...(_for === 'organization' ? { orgId: organization?.id } : {}),
        };

  const isClerkLoaded = !!(clerk.loaded && user);
  const resource = _for === 'organization' ? organization : user;

  const paymentMethods = usePagesOrInfinite<
    GetPaymentSourcesParams,
    ClerkPaginatedResponse<CommercePaymentSourceResource>
  >(
    paymentMethodsParams || {},
    resource?.getPaymentSources.bind(resource),
    {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      fetchOnMount: safeValues.fetchOnMount,
      enabled: !!paymentMethodsParams && isClerkLoaded && !!resource,
    },
    {
      type: 'commerce-payment-methods',
      userId: user?.id,
      ...(_for === 'organization' ? { orgId: organization?.id } : {}),
    },
  );

  return paymentMethods;
}
