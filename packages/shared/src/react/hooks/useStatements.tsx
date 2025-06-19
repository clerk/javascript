import type { ClerkPaginatedResponse, CommerceStatementResource, GetStatementsParams } from '@clerk/types';

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
export type UseStatementsParams = PaginatedHookConfig<PagesOrInfiniteOptions> & {
  for: 'organization' | 'user';
};

/**
 *
 */
export function useStatements<T extends UseStatementsParams>(
  params: T,
): PaginatedResources<CommerceStatementResource, T extends { infinite: true } ? true : false> {
  const { for: _for, ...paginationParams } = params;

  useAssertWrappedByClerkProvider('useStatements');

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

  clerk.telemetry?.record(eventMethodCalled('useStatements'));

  const statementsParams =
    typeof paginationParams === 'undefined'
      ? undefined
      : {
          initialPage: safeValues.initialPage,
          pageSize: safeValues.pageSize,
          ...(_for === 'organization' ? { orgId: organization?.id } : {}),
        };

  const isClerkLoaded = !!(clerk.loaded && user);

  const statements = usePagesOrInfinite<GetStatementsParams, ClerkPaginatedResponse<CommerceStatementResource>>(
    statementsParams || {},
    clerk.billing.getStatements,
    {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      fetchOnMount: safeValues.fetchOnMount,
      enabled: !!statementsParams && isClerkLoaded,
    },
    {
      type: 'commmerce-statements',
      userId: user?.id,
      ...(_for === 'organization' ? { orgId: organization?.id } : {}),
    },
  );

  return statements;
}
