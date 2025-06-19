import type { ClerkPaginatedResponse, CommercePaymentResource, GetPaymentAttemptsParams } from '@clerk/types';

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
export type UsePaymentAttemptsParams = PaginatedHookConfig<PagesOrInfiniteOptions> & {
  for: 'organization' | 'user';
};

/**
 *
 */
export function usePaymentAttempts<T extends UsePaymentAttemptsParams>(
  params: T,
): PaginatedResources<CommercePaymentResource, T extends { infinite: true } ? true : false> {
  const { for: _for, ...paginationParams } = params;

  useAssertWrappedByClerkProvider('usePaymentAttempts');

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

  clerk.telemetry?.record(eventMethodCalled('usePaymentAttempts'));

  const paymentAttemptsParams =
    typeof paginationParams === 'undefined'
      ? undefined
      : {
          initialPage: safeValues.initialPage,
          pageSize: safeValues.pageSize,
          ...(_for === 'organization' ? { orgId: organization?.id } : {}),
        };

  const isClerkLoaded = !!(clerk.loaded && user);

  const paymentAttempts = usePagesOrInfinite<GetPaymentAttemptsParams, ClerkPaginatedResponse<CommercePaymentResource>>(
    paymentAttemptsParams || {},
    clerk.billing.getPaymentAttempts,
    {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      fetchOnMount: safeValues.fetchOnMount,
      enabled: !!paymentAttemptsParams && isClerkLoaded,
    },
    {
      type: 'commerce-payment-attempts',
      userId: user?.id,
      ...(_for === 'organization' ? { orgId: organization?.id } : {}),
    },
  );

  return paymentAttempts;
}
