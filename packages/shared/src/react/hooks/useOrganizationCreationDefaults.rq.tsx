import { eventMethodCalled } from '../../telemetry/events/method-called';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext, useUserContext } from '../contexts';
import { useOrganizationCreationDefaultsCacheKeys } from './useOrganizationCreationDefaults.shared';
import type {
  UseOrganizationCreationDefaultsParams,
  UseOrganizationCreationDefaultsReturn,
} from './useOrganizationCreationDefaults.types';

/**
 * The `useOrganizationCreationDefaults()` hook retrieves the organization creation defaults for the current user.
 *
 * @example
 * ### Basic usage
 *
 * ```tsx
 * import { useOrganizationCreationDefaults } from '@clerk/clerk-react'
 *
 * export default function OrganizationCreationForm() {
 *   const { data, isLoading } = useOrganizationCreationDefaults()
 *
 *   if (isLoading) {
 *     return <div>Loading...</div>
 *   }
 *
 *   return (
 *     <div>
 *       <p>Default organization name: {data?.name}</p>
 *       <p>Default organization slug: {data?.slug}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useOrganizationCreationDefaults(
  params: UseOrganizationCreationDefaultsParams = {},
): UseOrganizationCreationDefaultsReturn {
  const { keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();

  clerk.telemetry?.record(eventMethodCalled('useOrganizationCreationDefaults'));

  const { queryKey } = useOrganizationCreationDefaultsCacheKeys({ userId: user?.id ?? null });

  const queryEnabled = Boolean(user) && enabled && clerk.loaded;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!user) {
        throw new Error('User is required to fetch organization creation defaults');
      }
      return user.getOrganizationCreationDefaults();
    },
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  return {
    data: query.data,
    error: (query.error ?? null) as UseOrganizationCreationDefaultsReturn['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
